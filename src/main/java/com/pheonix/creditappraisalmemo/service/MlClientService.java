package com.pheonix.creditappraisalmemo.service;

import com.pheonix.creditappraisalmemo.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;

/**
 * HTTP client that calls the Python FastAPI ML microservice.
 * Spring Boot owns all DB operations; Python owns all ML computations.
 *
 * If Python is unavailable, returns sensible fallback values
 * so the application continues to function without ML.
 */
@Service
public class MlClientService {

    private final RestTemplate restTemplate;
    private final RulesService rulesService;
    private final MlPredictionRepository predictionRepository;

    public MlClientService(RulesService rulesService,
                           MlPredictionRepository predictionRepository) {
        this.restTemplate = new RestTemplate();
        this.rulesService = rulesService;
        this.predictionRepository = predictionRepository;
    }

    private String baseUrl() {
        return rulesService.getConfig().getMlServiceUrl();
    }

    /**
     * Call /predict/risk — Logistic Regression risk score.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> predictRisk(Long applicationId,
                                           double gstVariancePct,
                                           int circularFlags,
                                           int totalGstPeriods,
                                           double avgMonthlyBalance,
                                           double creditDebitRatio,
                                           int suspiciousTxCount,
                                           int totalTxCount) {
        try {
            Map<String, Object> body = Map.of(
                    "application_id", applicationId,
                    "gst_variance_pct", gstVariancePct,
                    "circular_trading_flags", circularFlags,
                    "total_gst_periods", totalGstPeriods,
                    "avg_monthly_balance", avgMonthlyBalance,
                    "credit_debit_ratio", creditDebitRatio,
                    "suspicious_bank_tx_count", suspiciousTxCount,
                    "total_bank_tx_count", totalTxCount
            );
            ResponseEntity<Map> resp = restTemplate.postForEntity(
                    baseUrl() + "/predict/risk", body, Map.class);
            return resp.getBody();
        } catch (Exception e) {
            return Map.of("risk_score", 50.0, "decision", "MANUAL_REVIEW",
                    "confidence", 0.5, "risk_band", "MEDIUM");
        }
    }

    /**
     * Call /predict/fraud — Isolation Forest anomaly score.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> predictFraud(Long applicationId,
                                             int suspiciousTx,
                                             int totalTx,
                                             double maxCredit,
                                             double avgCredit,
                                             int circularFlags,
                                             double avgGstVariance) {
        try {
            Map<String, Object> body = Map.of(
                    "application_id", applicationId,
                    "suspicious_tx_count", suspiciousTx,
                    "total_tx_count", totalTx,
                    "max_single_credit", maxCredit,
                    "avg_credit", avgCredit,
                    "circular_flag_count", circularFlags,
                    "avg_gst_variance_pct", avgGstVariance
            );
            ResponseEntity<Map> resp = restTemplate.postForEntity(
                    baseUrl() + "/predict/fraud", body, Map.class);
            return resp.getBody();
        } catch (Exception e) {
            return Map.of("fraud_probability", 0.05, "fraud_probability_pct", "5.0%",
                    "anomaly_score", -0.1, "is_anomalous", false);
        }
    }

    /**
     * Call /predict/forecast — revenue projection.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> predictForecast(Long applicationId, List<Double> monthlyTurnovers) {
        try {
            Map<String, Object> body = Map.of(
                    "application_id", applicationId,
                    "monthly_turnovers", monthlyTurnovers
            );
            ResponseEntity<Map> resp = restTemplate.postForEntity(
                    baseUrl() + "/predict/forecast", body, Map.class);
            return resp.getBody();
        } catch (Exception e) {
            return Map.of("next_3_months_forecast", List.of(0.0, 0.0, 0.0),
                    "trend", "STABLE", "growth_rate_pct", 0.0, "forecast_confidence", 0.3);
        }
    }

    /**
     * Call /predict/loan — loan recommendation.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> predictLoan(Long applicationId,
                                            double avgBalance,
                                            double avgCredit,
                                            double riskScore,
                                            double gstVariance,
                                            int suspiciousTx) {
        try {
            Map<String, Object> body = Map.of(
                    "application_id", applicationId,
                    "avg_monthly_balance", avgBalance,
                    "avg_monthly_credit", avgCredit,
                    "risk_score", riskScore,
                    "gst_variance_pct", gstVariance,
                    "suspicious_tx_count", suspiciousTx
            );
            ResponseEntity<Map> resp = restTemplate.postForEntity(
                    baseUrl() + "/predict/loan", body, Map.class);
            return resp.getBody();
        } catch (Exception e) {
            return Map.of("recommended_max_loan", 0.0, "recommended_tenor_months", 36,
                    "emi_estimate", 0.0, "recommendation_tier", "RESTRICTED");
        }
    }

    /**
     * Call /predict/qualitative — adjusts risk score based on Credit Officer's field observations.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> predictQualitative(Long applicationId,
                                                   int capacityUtilizationPct,
                                                   String promoterAssessment,
                                                   boolean hasLegalConcerns,
                                                   String siteNotes,
                                                   String interviewNotes) {
        try {
            Map<String, Object> body = Map.of(
                    "application_id", applicationId,
                    "capacity_utilization_pct", capacityUtilizationPct,
                    "promoter_assessment", promoterAssessment,
                    "has_legal_concerns", hasLegalConcerns,
                    "site_notes_length", siteNotes.length(),
                    "interview_notes_length", interviewNotes.length()
            );
            ResponseEntity<Map> resp = restTemplate.postForEntity(
                    baseUrl() + "/predict/qualitative", body, Map.class);
            return resp.getBody();
        } catch (Exception e) {
            return Map.of("score_adjustment", 0.0, "sentiment", "NEUTRAL",
                    "adjustment_reason", "ML service unavailable");
        }
    }

    /** Save all ML predictions back to the DB for caching. */

    public MlPredictionResult savePredictions(Long applicationId,
                                               Map<String, Object> risk,
                                               Map<String, Object> fraud,
                                               Map<String, Object> forecast,
                                               Map<String, Object> loan) {
        MlPredictionResult result = predictionRepository
                .findByApplicationId(applicationId)
                .orElse(new MlPredictionResult());

        result.setApplicationId(applicationId);

        if (risk != null) {
            result.setRiskScore(toDouble(risk.get("risk_score")));
            result.setDecision((String) risk.get("decision"));
            result.setRiskConfidence(toDouble(risk.get("confidence")));
            result.setRiskBand((String) risk.get("risk_band"));
        }
        if (fraud != null) {
            result.setFraudProbability(toDouble(fraud.get("fraud_probability")));
            result.setFraudProbabilityPct((String) fraud.get("fraud_probability_pct"));
            result.setIsAnomalous((Boolean) fraud.get("is_anomalous"));
        }
        if (forecast != null) {
            result.setForecastJson(forecast.get("next_3_months_forecast").toString());
            result.setRevenueTrend((String) forecast.get("trend"));
            result.setGrowthRatePct(toDouble(forecast.get("growth_rate_pct")));
        }
        if (loan != null) {
            result.setRecommendedMaxLoan(toDouble(loan.get("recommended_max_loan")));
            result.setRecommendedTenorMonths(toInt(loan.get("recommended_tenor_months")));
            result.setEmiEstimate(toDouble(loan.get("emi_estimate")));
            result.setRecommendationTier((String) loan.get("recommendation_tier"));
        }

        return predictionRepository.save(result);
    }

    private double toDouble(Object v) {
        if (v == null) return 0.0;
        return v instanceof Number ? ((Number) v).doubleValue() : 0.0;
    }

    private int toInt(Object v) {
        if (v == null) return 0;
        return v instanceof Number ? ((Number) v).intValue() : 0;
    }
}
