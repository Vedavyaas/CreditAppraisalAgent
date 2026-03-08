package com.pheonix.creditappraisalmemo.service;

import com.pheonix.creditappraisalmemo.aspect.AuditAction;
import com.pheonix.creditappraisalmemo.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Replaces the old mock ML report with real Python model calls.
 *
 * Flow:
 *   1. Fetch GST + Bank data from DB (Spring owns all data)
 *   2. Aggregate features from raw data
 *   3. POST features to Python FastAPI (4 model calls)
 *   4. Save predictions to MlPredictionResult table
 *   5. Build and return a rich AutomatedReportDTO
 */
@Service
public class AutomatedReportService {

    private final GstEntryRepository gstEntryRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final MlClientService mlClientService;
    private final RulesService rulesService;
    private final CreditApplicationRepository applicationRepository;
    private final WebResearchRepository researchRepository;
    private final QualitativeNoteRepository qualitativeNoteRepository;

    public AutomatedReportService(GstEntryRepository gstEntryRepository,
                                   BankTransactionRepository bankTransactionRepository,
                                   MlClientService mlClientService,
                                   RulesService rulesService,
                                   CreditApplicationRepository applicationRepository,
                                   WebResearchRepository researchRepository,
                                   QualitativeNoteRepository qualitativeNoteRepository) {
        this.gstEntryRepository = gstEntryRepository;
        this.bankTransactionRepository = bankTransactionRepository;
        this.mlClientService = mlClientService;
        this.rulesService = rulesService;
        this.applicationRepository = applicationRepository;
        this.researchRepository = researchRepository;
        this.qualitativeNoteRepository = qualitativeNoteRepository;
    }

    @AuditAction("Automated ML synthesis & risk appraisal report generated")
    public AutomatedReportDTO generateReport(Long applicationId) {
        
        CreditApplication app = applicationRepository.findById(applicationId).orElse(null);

        // ── 1. Fetch raw data from DB ────────────────────────────────────────
        List<GstEntry> gstEntries = gstEntryRepository.findAll().stream()
                .filter(g -> applicationId.equals(g.getApplicationId()))
                .collect(Collectors.toList());

        List<BankTransaction> bankTxns = bankTransactionRepository.findAll().stream()
                .filter(b -> applicationId.equals(b.getApplicationId()))
                .collect(Collectors.toList());

        // ── 2. Aggregate features ────────────────────────────────────────────
        int circularFlags = (int) gstEntries.stream().filter(GstEntry::isCircularTradingFlag).count();
        int totalGstPeriods = gstEntries.size();

        double avgGstVariancePct = gstEntries.stream()
                .filter(g -> g.getGstr3bTurnover() != null && g.getGstr3bTurnover().compareTo(BigDecimal.ZERO) > 0)
                .mapToDouble(g -> g.getDifference().doubleValue() / g.getGstr3bTurnover().doubleValue() * 100)
                .average().orElse(0.0);

        double totalCredit = bankTxns.stream()
                .mapToDouble(b -> b.getCredit() != null ? b.getCredit().doubleValue() : 0.0)
                .sum();
        double totalDebit = bankTxns.stream()
                .mapToDouble(b -> b.getDebit() != null ? b.getDebit().doubleValue() : 0.0)
                .sum();
        double avgBalance = bankTxns.stream()
                .mapToDouble(b -> b.getBalance() != null ? b.getBalance().doubleValue() : 0.0)
                .average().orElse(0.0);

        double cdRatio = totalDebit > 0 ? totalCredit / totalDebit : 1.5;
        int suspiciousCount = (int) bankTxns.stream().filter(BankTransaction::isSuspiciousFlag).count();
        int totalTxCount = bankTxns.size();

        double maxCredit = bankTxns.stream()
                .mapToDouble(b -> b.getCredit() != null ? b.getCredit().doubleValue() : 0.0)
                .max().orElse(0.0);
        double avgCredit = totalTxCount > 0 ? totalCredit / totalTxCount : 0.0;
        double avgMonthlyCredit = totalGstPeriods > 0 ? totalCredit / totalGstPeriods : avgCredit;

        // Monthly GST turnovers for forecasting
        List<Double> monthlyTurnovers = gstEntries.stream()
                .filter(g -> g.getGstr3bTurnover() != null)
                .map(g -> g.getGstr3bTurnover().doubleValue())
                .collect(Collectors.toList());

        // ── 3. Call Python ML models (Spring → Python, via HTTP) ─────────────
        Map<String, Object> risk = mlClientService.predictRisk(
                applicationId, avgGstVariancePct, circularFlags, totalGstPeriods,
                avgBalance, cdRatio, suspiciousCount, totalTxCount);

        Map<String, Object> fraud = mlClientService.predictFraud(
                applicationId, suspiciousCount, totalTxCount,
                maxCredit, avgCredit, circularFlags, avgGstVariancePct);

        Map<String, Object> forecast = mlClientService.predictForecast(
                applicationId, monthlyTurnovers);

        double assuranceScore = toDouble(risk.get("assurance_score"));

        Map<String, Object> loan = mlClientService.predictLoan(
                applicationId, avgBalance, avgMonthlyCredit, assuranceScore,
                avgGstVariancePct, suspiciousCount);

        // ── 4. Save ALL predictions to DB (cached) ───────────────────────────
        mlClientService.savePredictions(applicationId, risk, fraud, forecast, loan);

        // ── 5. Apply Rules Engine & Neural Network Constraints ────────────────
        double maxAutoApproval = rulesService.getConfig().getMaxAutoApprovalLoanAmount();
        double recommendedLoan = toDouble(loan.get("recommended_max_loan"));
        String decision = (String) risk.get("decision");
        
        // Apply limit multiplier (removed Persona constraints)
        double finalConstrainedLoan = recommendedLoan;
        
        // Ensure Assurance Score Bounds
        double finalAssuranceScore = assuranceScore;
        if (finalAssuranceScore >= 100) finalAssuranceScore = 100.0;
        if (finalAssuranceScore < 0) finalAssuranceScore = 0.0;

        // Dynamically override the final algorithmic decision based on the constrained assurance bracket
        if (finalAssuranceScore >= 75) {
             decision = "APPROVED";
        } else if (finalAssuranceScore >= 40 && "APPROVED".equals(decision)) {
             decision = "MANUAL_REVIEW";
        } else if (finalAssuranceScore < 40) {
             decision = "REJECTED";
        }

        // Apply rules engine limits
        if ("APPROVED".equals(decision) && finalConstrainedLoan > maxAutoApproval) {
            decision = "MANUAL_REVIEW";
        }

        // ── 5.5 Make DB the Single Source of Truth ───────────────────────────
        mlClientService.updateFinalConstraints(applicationId, finalAssuranceScore, decision, finalConstrainedLoan);

        // ── 6. Build and return report ───────────────────────────────────────
        List<String> keyDrivers;
        if (circularFlags > 0 || suspiciousCount > 0) {
            keyDrivers = List.of(
                    String.format("Circular trading detected in %d of %d GST periods", circularFlags, totalGstPeriods),
                    String.format("%d suspicious bank transactions flagged", suspiciousCount),
                    String.format("GST variance: %.1f%% (Threshold: %.1f%%)",
                            avgGstVariancePct, rulesService.getConfig().getGstVarianceThreshold() * 100)
            );
        } else {
            keyDrivers = List.of(
                    String.format("Zero circular trading flags across %d GST periods", totalGstPeriods),
                    String.format("Healthy credit/debit ratio: %.2f", cdRatio),
                    String.format("Revenue trend: %s (%.1f%% growth)", forecast.get("trend"), toDouble(forecast.get("growth_rate_pct")))
            );
        }

        return new AutomatedReportDTO(
                "APP-90" + (100 + applicationId),
                (app != null ? app.getCompanyName() : "Borrower") + " (App #" + applicationId + ")",
                finalConstrainedLoan,  // Show constraint-applied loan amount
                (int) finalAssuranceScore,  // Show constraint-adjusted assurance score
                decision,
                (String) fraud.get("fraud_probability_pct"),
                "N/A", // Default for dtiRatio
                keyDrivers
        );
    }

    private double toDouble(Object v) {
        if (v == null) return 0.0;
        return v instanceof Number ? ((Number) v).doubleValue() : 0.0;
    }
}
