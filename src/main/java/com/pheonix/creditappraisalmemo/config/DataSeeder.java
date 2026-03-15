package com.pheonix.creditappraisalmemo.config;

import com.pheonix.creditappraisalmemo.assets.Role;
import com.pheonix.creditappraisalmemo.domain.*;
import com.pheonix.creditappraisalmemo.repository.UserDetailsRepository;
import com.pheonix.creditappraisalmemo.repository.UserDetailsEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * DataSeeder — populates the database with realistic Indian corporate
 * credit appraisal data. Updated for persistent PostgreSQL storage to
 * prevent duplication on restarts.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CreditApplicationRepository appRepo;
    private final GstEntryRepository gstRepo;
    private final BankTransactionRepository bankRepo;
    private final MlPredictionRepository mlRepo;
    private final QualitativeNoteRepository ddRepo;
    private final WebResearchRepository researchRepo;
    private final DocumentRepository docRepo;
    private final UserDetailsRepository userRepo;
    private final CreditScoreRepository scoreRepo;
    private final RulesConfigRepository rulesRepo;
    private final PasswordEncoder encoder;

    public DataSeeder(CreditApplicationRepository appRepo,
            GstEntryRepository gstRepo,
            BankTransactionRepository bankRepo,
            MlPredictionRepository mlRepo,
            QualitativeNoteRepository ddRepo,
            WebResearchRepository researchRepo,
            DocumentRepository docRepo,
            UserDetailsRepository userRepo,
            CreditScoreRepository scoreRepo,
            RulesConfigRepository rulesRepo,
            PasswordEncoder encoder) {
        this.appRepo = appRepo;
        this.gstRepo = gstRepo;
        this.bankRepo = bankRepo;
        this.mlRepo = mlRepo;
        this.ddRepo = ddRepo;
        this.researchRepo = researchRepo;
        this.docRepo = docRepo;
        this.userRepo = userRepo;
        this.scoreRepo = scoreRepo;
        this.rulesRepo = rulesRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("DataSeeder: starting database seeding process...");

        try {
            seedUsersInTransaction();
            seedApplicationsInTransaction();
            seedRulesConfigInTransaction();
            log.info("DataSeeder: seeding process complete.");
        } catch (Exception e) {
            log.error("DataSeeder: CRITICAL ERROR during seeding! {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void seedUsersInTransaction() {
        log.info("DataSeeder: seeding users...");
        seedUsers();
        log.info("DataSeeder: users seeded successfully. (Count: {})", userRepo.count());
    }

    @Transactional
    public void seedApplicationsInTransaction() {
        log.info("DataSeeder: seeding applications...");
        seedApplications();
        log.info("DataSeeder: applications seeded successfully.");
    }

    @Transactional
    public void seedRulesConfigInTransaction() {
        log.info("DataSeeder: seeding rules config...");
        seedRulesConfig();
        log.info("DataSeeder: rules config seeded successfully.");
    }

    // ── Application portfolio ─────────────────────────────────────────────────
    private record AppTemplate(
            String name, String cin, String gst, String industry, String city,
            double revenueBaseLakh, // base monthly GSTR-3B in lakhs
            double variancePct, // GSTR 2A variance %
            boolean hasCircular,
            String riskBand, // LOW / MEDIUM / HIGH
            String decision,
            int capacityPct,
            String promoter,
            boolean legalConcerns,
            String assignedTo // email of owner
    ) {
    }

    private static final List<AppTemplate> TEMPLATES = List.of(
            new AppTemplate("Moneybox Finance", "U65923MH1994PLC083147", "27AAACM1234B1Z5",
                    "Financial Services", "Mumbai", 199.2, 2.5, false, "LOW", "APPROVED", 100, "STRONG", false,
                    "credit@test.com"),
            new AppTemplate("Kinara Capital", "U65921KA1996PTC068587", "29AAACK1234A1Z5",
                    "Financial Services", "Bengaluru", 314.2, 3.2, false, "LOW", "APPROVED", 100, "STRONG", false,
                    "credit@test.com"),
            new AppTemplate("Tata Capital Limited", "U65990MH1991PLC060670", "27AAACT1234B1Z5",
                    "Financial Services", "Mumbai", 18500, 1.1, false, "LOW", "APPROVED", 100, "STRONG", false,
                    "manager@test.com"),
            new AppTemplate("TechNova Solutions Pvt Ltd", "U72900KA2019PTC123456", "29AAACT1234A1Z5",
                    "IT Services", "Bengaluru", 200, 5.2, false, "LOW", "APPROVED", 85, "STRONG", false,
                    "credit@test.com"),
            new AppTemplate("Global Impex Traders", "U51900MH2015PTC234567", "27AAACG5678B2Z6",
                    "Import/Export", "Mumbai", 750, 18.4, true, "HIGH", "REJECTED", 42, "CONCERNING", true,
                    "analyst@test.com"),
            new AppTemplate("Blue Ridge Manufacturing", "U28900MH2010PTC345678", "27AAABC9012C3Z7",
                    "Manufacturing", "Pune", 120, 12.1, false, "MEDIUM", "MANUAL_REVIEW", 61, "NEUTRAL", false,
                    "credit@test.com"),
            new AppTemplate("Aurelia Pharma Ltd", "L24230MH2005PLC678901", "27AAAAP3456D4Z8",
                    "Pharmaceuticals", "Hyderabad", 480, 4.8, false, "LOW", "APPROVED", 78, "STRONG", false,
                    "analyst@test.com"),
            new AppTemplate("Sunrise Agro Industries", "U01100UP2012PTC789012", "09AAACS7890E5Z9",
                    "Agribusiness", "Lucknow", 95, 22.6, true, "HIGH", "REJECTED", 35, "CONCERNING", true,
                    "manager@test.com"),
            new AppTemplate("IndoCity Infrastructure Ltd", "L45200DL2008PLC890123", "07AAAAI1234F6Z1",
                    "Infrastructure", "Delhi", 1100, 8.5, false, "MEDIUM", "MANUAL_REVIEW", 70, "NEUTRAL", false,
                    "credit@test.com"),
            new AppTemplate("Coastal Seafoods Export Pvt Ltd", "U15400GJ2018PTC901234", "24AAAAC5678G7Z2",
                    "Food Processing", "Surat", 320, 6.3, false, "LOW", "APPROVED", 80, "STRONG", false,
                    "analyst@test.com"),
            new AppTemplate("Nexgen Renewable Energy Pvt Ltd", "U40100RJ2020PTC012345", "08AAAAN9012H8Z3",
                    "Renewable Energy", "Jaipur", 560, 3.1, false, "LOW", "APPROVED", 90, "STRONG", false,
                    "credit@test.com"),
            new AppTemplate("Bharat Forge Dynamics", "U29100PN2014PTC123890", "27AAABF1234K1Z0",
                    "Heavy Industry", "Nagpur", 900, 14.2, false, "MEDIUM", "MANUAL_REVIEW", 75, "STRONG", false,
                    "manager@test.com"),
            new AppTemplate("Kaveri Textiles Pvt Ltd", "U17100TN2011PTC098711", "33AAACK4567L1Z1",
                    "Textiles", "Coimbatore", 180, 25.1, true, "HIGH", "REJECTED", 45, "NEUTRAL", true,
                    "analyst@test.com"));

    private void seedApplications() {
        Random rng = new Random(42);

        for (AppTemplate t : TEMPLATES) {
            // Check if application already exists by CIN
            if (appRepo.findByCin(t.cin()).isPresent()) {
                log.debug("DataSeeder: Skipping application {} as CIN already exists.", t.name());
                continue;
            }

            log.info("DataSeeder: seeding application: {}", t.name());

            // 1. CreditApplication
            CreditApplication app = new CreditApplication();
            app.setCompanyName(t.name());
            app.setCin(t.cin());
            app.setGstNumber(t.gst());
            app.setIndustry(t.industry());
            app.setCity(t.city());
            app.setCreatedBy(t.assignedTo());
            app.setStatus(switch (t.decision()) {
                case "APPROVED" -> CreditApplication.ApplicationStatus.DECIDED;
                case "REJECTED" -> CreditApplication.ApplicationStatus.DECIDED;
                default -> CreditApplication.ApplicationStatus.IN_REVIEW;
            });
            CreditApplication saved = appRepo.save(app);
            Long id = saved.getId();

            // 2. GST entries — 12 months (FY24 + FY25 partial)
            seedGst(id, t, rng);

            // 3. Bank transactions — 30 rows
            seedBank(id, t, rng);

            // 4. ML prediction (pre-computed)
            seedMl(id, t, rng);

            // 5. Due Diligence Note
            seedDd(id, t);

            // 6. Web Research (Research Agent — DB-backed)
            seedResearch(id, t);

            // 7. Documents
            seedDocuments(id);

            // 8. Credit Score (5 C's Assessment)
            seedScores(id, t, rng);
        }
    }

    // ── GST seeding ───────────────────────────────────────────────────────────
    private void seedGst(Long appId, AppTemplate t, Random rng) {
        String[] PERIODS = {
                "2024-04", "2024-05", "2024-06", "2024-07", "2024-08", "2024-09",
                "2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03"
        };
        for (String period : PERIODS) {
            double g3b = t.revenueBaseLakh() * (0.9 + rng.nextDouble() * 0.2) * 1_00_000;
            double varianceFactor = (t.variancePct() + rng.nextDouble() * 3) / 100.0;
            double g2a = g3b * (1.0 - varianceFactor);
            boolean circular = t.hasCircular() && varianceFactor > 0.15;
            BigDecimal b3b = bdOf(g3b);
            BigDecimal b2a = bdOf(g2a);
            BigDecimal diff = b3b.subtract(b2a).abs();

            GstEntry e = new GstEntry();
            e.setApplicationId(appId);
            e.setPeriod(period);
            e.setGstr3bTurnover(b3b);
            e.setGstr2aTurnover(b2a);
            e.setDifference(diff);
            e.setCircularTradingFlag(circular);
            gstRepo.save(e);
        }
    }

    // ── Bank seeding ──────────────────────────────────────────────────────────
    private void seedBank(Long appId, AppTemplate t, Random rng) {
        LocalDate startDate = LocalDate.of(2024, 4, 1);
        double balance = t.revenueBaseLakh() * 3 * 1_00_000;

        String[] CREDIT_DESC = {
                "RTGS from Customer", "NEFT Receivable", "Export Proceeds", "Advance Payment",
                "GST Refund Credit", "Interest Income", "Dividend Income", "Sales Receipt"
        };
        String[] DEBIT_DESC = {
                "Salary Payment", "Vendor Payment RTGS", "Raw Material Purchase",
                "GST Payment Challan", "Loan EMI Debit", "Rent Payment", "Utility Bills", "Insurance Premium"
        };

        for (int i = 0; i < 30; i++) {
            LocalDate txDate = startDate.plusDays(rng.nextInt(360));
            boolean isCredit = rng.nextBoolean();
            boolean suspicious = t.hasCircular() && i < 5 && rng.nextDouble() < 0.4;

            double amount = t.revenueBaseLakh() * 0.5 * 1_00_000 * (0.5 + rng.nextDouble());
            if (suspicious) {
                amount = Math.round(amount / 10_000.0) * 10_000.0;
            }

            if (isCredit)
                balance += amount;
            else
                balance = Math.max(0, balance - amount);

            BankTransaction tx = new BankTransaction();
            tx.setApplicationId(appId);
            tx.setTransactionDate(txDate);
            tx.setDescription(isCredit ? CREDIT_DESC[i % CREDIT_DESC.length] : DEBIT_DESC[i % DEBIT_DESC.length]);
            if (isCredit)
                tx.setCredit(bdOf(amount));
            else
                tx.setDebit(bdOf(amount));
            tx.setBalance(bdOf(balance));
            tx.setSuspiciousFlag(suspicious);
            bankRepo.save(tx);
        }
    }

    // ── ML Prediction seeding ─────────────────────────────────────────────────
    private void seedMl(Long appId, AppTemplate t, Random rng) {
        double baseScore = switch (t.riskBand()) {
            case "LOW" -> 78;
            case "HIGH" -> 28;
            default -> 54;
        };
        double riskScore = baseScore + (rng.nextDouble() - 0.5) * 8;
        double fraud = t.hasCircular() ? 0.25 + rng.nextDouble() * 0.15 : rng.nextDouble() * 0.06;
        String trend = switch (t.riskBand()) {
            case "LOW" -> "GROWING";
            case "HIGH" -> "DECLINING";
            default -> "STABLE";
        };
        double growth = switch (t.riskBand()) {
            case "LOW" -> 8 + rng.nextDouble() * 5;
            case "HIGH" -> -(5 + rng.nextDouble() * 5);
            default -> rng.nextDouble() * 4 - 1;
        };
        double maxLoan = t.revenueBaseLakh() * 12 * (riskScore / 100.0) * 1_00_000 * 0.5;
        int tenor = switch (t.riskBand()) {
            case "LOW" -> 60;
            case "HIGH" -> 24;
            default -> 36;
        };
        double emi = maxLoan > 0 ? (maxLoan * 0.09 / 12) / (1 - Math.pow(1 + 0.09 / 12, -tenor)) : 0;
        String tier = switch (t.riskBand()) {
            case "LOW" -> "PRIME";
            case "HIGH" -> "RESTRICTED";
            default -> "STANDARD";
        };

        double base = t.revenueBaseLakh() * 1_00_000;
        double f1 = base * (1 + growth / 100), f2 = f1 * (1 + growth / 100), f3 = f2 * (1 + growth / 100);
        String forecast = String.format("[%.0f, %.0f, %.0f]", f1, f2, f3);

        MlPredictionResult ml = new MlPredictionResult();
        ml.setApplicationId(appId);
        ml.setAssuranceScore(round2(riskScore));
        ml.setDecision(t.decision());
        ml.setAssuranceConfidence(round2(0.7 + rng.nextDouble() * 0.25));
        ml.setAssuranceBand(t.riskBand());
        ml.setFraudProbability(round2(fraud));
        ml.setFraudProbabilityPct(String.format("%.1f%%", fraud * 100));
        ml.setIsAnomalous(t.hasCircular());
        ml.setForecastJson(forecast);
        ml.setRevenueTrend(trend);
        ml.setGrowthRatePct(round2(growth));
        ml.setRecommendedMaxLoan(round2(maxLoan));
        ml.setRecommendedTenorMonths(tenor);
        ml.setEmiEstimate(round2(emi));
        ml.setRecommendationTier(tier);
        mlRepo.save(ml);
    }

    // ── Due Diligence seeding ─────────────────────────────────────────────────
    private void seedDd(Long appId, AppTemplate t) {
        if ("Moneybox Finance".equals(t.name())) {
            QualitativeNote mNote = new QualitativeNote();
            mNote.setApplicationId(appId);
            mNote.setCapacityUtilizationPct(100);
            mNote.setPromoterAssessment("STRONG");
            mNote.setLegalConcernsNoted("No major legal concerns currently. Statutory audits are consistently conducted by Gaur & Associates.");
            mNote.setSiteVisitObservations(
                    "Aggressive growth in loan book. AUM increased significantly from ₹39.13 crore in FY20 to ₹927 crore in FY25. " +
                    "Total Income grew from ₹4.17 crore in FY20 to ₹199.2 crore in FY25. " +
                    "Geographic Footprint expanded from 11 branches in 4 states to 163 branches across 12 states by FY25. " +
                    "Product Pivot: Strategically shifting from unsecured to secured lending; secured loans accounted for 45% of AUM in FY25, up from 5% in FY23. " + 
                    "Target Segment: Focuses on the 'Missing Middle' in Tier-3 and below towns.");
            mNote.setManagementInterviewNotes(
                    "Led by Co-CEOs Deepak Aggarwal and Mayur Modi, with a core team possessing over 80 years of combined BFSI experience. " +
                    "Board Structure: Includes independent directors like Mr. Uma Shankar Paliwal (Chairman) and Ms. Ratna Dharashree Vishwanathan.");
            mNote.setQualitativeScoreAdjustment(12.0);
            mNote.setOverallSentiment("POSITIVE");
            mNote.setSubmittedBy("officer@intellicredit.in");
            ddRepo.save(mNote);
            return;
        } else if ("Kinara Capital".equals(t.name())) {
            QualitativeNote kNote = new QualitativeNote();
            kNote.setApplicationId(appId);
            kNote.setCapacityUtilizationPct(100);
            kNote.setPromoterAssessment("STRONG");
            kNote.setLegalConcernsNoted("None.");
            kNote.setSiteVisitObservations(
                    "Strong growth with AUM at ~₹3,142 crore (30% YoY growth). " +
                    "Reach expands across 133 branches in 10 states. Focus remains on MSME Unsecured loans.");
            kNote.setManagementInterviewNotes("Clear strategic focus on unsecured MSME lending with robust tech integration.");
            kNote.setQualitativeScoreAdjustment(10.0);
            kNote.setOverallSentiment("POSITIVE");
            kNote.setSubmittedBy("officer@intellicredit.in");
            ddRepo.save(kNote);
            return;
        } else if ("Tata Capital Limited".equals(t.name())) {
            QualitativeNote tNote = new QualitativeNote();
            tNote.setApplicationId(appId);
            tNote.setCapacityUtilizationPct(100);
            tNote.setPromoterAssessment("STRONG");
            tNote.setLegalConcernsNoted("None. Impeccable corporate governance standard.");
            tNote.setSiteVisitObservations(
                    "Systemic market presence. Highly diversified retail and corporate portfolio. " +
                    "AUM exceeds ₹1,85,000+ crore.");
            tNote.setManagementInterviewNotes("Backed by the Tata Group. High capital security and robust risk management.");
            tNote.setQualitativeScoreAdjustment(15.0);
            tNote.setOverallSentiment("POSITIVE");
            tNote.setSubmittedBy("manager@intellicredit.in");
            ddRepo.save(tNote);
            return;
        }

        QualitativeNote note = new QualitativeNote();
        note.setApplicationId(appId);
        note.setCapacityUtilizationPct(t.capacityPct());
        note.setPromoterAssessment(t.promoter());
        note.setLegalConcernsNoted(t.legalConcerns()
                ? "Ongoing GST dispute for FY22 (₹40L). Labour court matter pending."
                : "");
        note.setSiteVisitObservations(
                t.capacityPct() >= 70
                        ? "Factory operating at full capacity. Modern machinery observed. Clean facility with ISO certifications visible."
                        : t.capacityPct() >= 50
                                ? "Plant partially operational. Some idle lines. Management cited seasonal slowdown."
                                : "Only " + t.capacityPct()
                                        + "% capacity online. Multiple idle units. Dust accumulation on machinery suggests prolonged inactivity.");
        note.setManagementInterviewNotes(
                t.promoter().equals("STRONG")
                        ? "MD with 20+ years sector experience. CFO from Big4 background. Transparent about financials and growth roadmap."
                        : t.promoter().equals("CONCERNING")
                                ? "Management was evasive about operational details. CFO declined to share detailed projections. Several related-party transactions not adequately explained."
                                : "Standard profile. Management cooperative. No red flags but limited strategic clarity.");
        double adj = (t.capacityPct() >= 80 ? 8 : t.capacityPct() >= 60 ? 3 : t.capacityPct() >= 40 ? -4 : -8)
                + (t.promoter().equals("STRONG") ? 7 : t.promoter().equals("CONCERNING") ? -7 : 0)
                + (t.legalConcerns() ? -10 : 0);
        note.setQualitativeScoreAdjustment(Math.max(-20, Math.min(20, adj)));
        note.setOverallSentiment(adj > 3 ? "POSITIVE" : adj < -3 ? "NEGATIVE" : "NEUTRAL");
        note.setSubmittedBy("officer@intellicredit.in");
        ddRepo.save(note);
    }

    // ── Document seeding ──────────────────────────────────────────────────────
    private void seedDocuments(Long appId) {
        Document doc1 = new Document();
        doc1.setApplicationId(appId);
        doc1.setFileName("Bank_Statement_FY24.csv");
        doc1.setFilePath("/docs/Bank_Statement_FY24.csv");
        doc1.setType(Document.DocumentType.BANK_STATEMENT);
        doc1.setExtractionStatus(Document.ExtractionStatus.DONE);
        docRepo.save(doc1);

        Document doc2 = new Document();
        doc2.setApplicationId(appId);
        doc2.setFileName("GST_Returns_Q1-Q4_FY24.csv");
        doc2.setFilePath("/docs/GST_Returns_Q1-Q4_FY24.csv");
        doc2.setType(Document.DocumentType.GST_RETURN);
        doc2.setExtractionStatus(Document.ExtractionStatus.DONE);
        docRepo.save(doc2);

        Document doc3 = new Document();
        doc3.setApplicationId(appId);
        doc3.setFileName("Annual_Report_FY23.pdf");
        doc3.setFilePath("/docs/Annual_Report_FY23.pdf");
        doc3.setType(Document.DocumentType.ANNUAL_REPORT);
        doc3.setExtractionStatus(Document.ExtractionStatus.DONE);
        docRepo.save(doc3);
    }

    // ── Web Research seeding ──────────────────────────────────────────────────
    private void seedResearch(Long appId, AppTemplate t) {
        if ("Moneybox Finance".equals(t.name())) {
            WebResearchResult r = new WebResearchResult();
            r.setApplicationId(appId);
            r.setMcaCin(t.cin());
            r.setMcaRegisteredDate("1994-11-16");
            r.setMcaPaidUpCapital("₹ 2744 Lakhs");
            r.setMcaDirectorCount(6);
            r.setMcaFilingStatus("Compliant (AOC-4 filed on time)");
            r.setMcaActive(true);
            r.setNewsItemsJson("[{\"headline\":\"Moneyboxx maintains capital levels well above regulatory requirements to support its growth plans. Profitability PAT moderated to ₹1.2 crore in FY25 from ₹9.1 crore in FY24 due to higher impairment.\",\"sentiment\":\"POSITIVE\",\"source\":\"Mint\",\"date\":\"2025-03-01\"}]");
            r.setNewsOverallSentiment("POSITIVE");
            r.setECourtsCaseCount(0);
            r.setDgftAlerts("None");
            r.setSebiWatchlist(false);
            r.setLitigationNote("Statutory audits are consistently conducted by Gaur & Associates.");
            r.setCibilScore(750);
            r.setCibilOutstandingLoans(33); // Represents 33 lenders (diversified from 2 in FY20)
            r.setCibilOverdueAccounts(0);
            r.setCibilGrade("A");
            r.setSectorName(t.industry());
            r.setSectorHeadwind("Asset quality shows stress: GNPA increased from 1.54% in FY24 to 6.6% in FY25 following sectoral stress. NNPA stood at 3.4% in FY25. Provision Coverage Ratio maintained at 50%.");
            r.setRbiPolicyNote("Capital Adequacy Ratio (CRAR) stood at 29.3% in March 2025. Marginal cost of funds trended downward from 14.1% in FY23 to 12.3% in FY25.");
            r.setSectorGrowthPct(15.0);
            r.setCrawlSource("SEEDED");
            researchRepo.save(r);
            return;
        } else if ("Kinara Capital".equals(t.name())) {
            WebResearchResult r = new WebResearchResult();
            r.setApplicationId(appId);
            r.setMcaCin(t.cin());
            r.setMcaRegisteredDate("1996-01-05");
            r.setMcaPaidUpCapital("₹ 3200 Lakhs");
            r.setMcaDirectorCount(8);
            r.setMcaFilingStatus("Compliant (AOC-4 filed on time)");
            r.setMcaActive(true);
            r.setNewsItemsJson("[{\"headline\":\"Kinara Capital announces PAT of ₹62 crore and 30% YoY AUM growth, solidifying market position in MSME sector.\",\"sentiment\":\"POSITIVE\",\"source\":\"Business Standard\",\"date\":\"2025-02-15\"}]");
            r.setNewsOverallSentiment("POSITIVE");
            r.setECourtsCaseCount(0);
            r.setDgftAlerts("None");
            r.setSebiWatchlist(false);
            r.setLitigationNote("No active litigation found.");
            r.setCibilScore(760);
            r.setCibilOutstandingLoans(15);
            r.setCibilOverdueAccounts(0);
            r.setCibilGrade("A");
            r.setSectorName(t.industry());
            r.setSectorHeadwind("Asset Quality stable with GNPA at 2.48%. Yield focus on MSME Unsecured.");
            r.setRbiPolicyNote("Capital Adequacy Ratio (CRAR) at 25.2%.");
            r.setSectorGrowthPct(18.0);
            r.setCrawlSource("SEEDED");
            researchRepo.save(r);
            return;
        } else if ("Tata Capital Limited".equals(t.name())) {
            WebResearchResult r = new WebResearchResult();
            r.setApplicationId(appId);
            r.setMcaCin(t.cin());
            r.setMcaRegisteredDate("1991-03-08");
            r.setMcaPaidUpCapital("₹ 250000 Lakhs");
            r.setMcaDirectorCount(12);
            r.setMcaFilingStatus("Compliant (AOC-4 filed on time)");
            r.setMcaActive(true);
            r.setNewsItemsJson("[{\"headline\":\"Tata Capital maintains highest safety rating AAA, sustaining robust growth with Net NPA between 0.4% and 0.5%.\",\"sentiment\":\"POSITIVE\",\"source\":\"Economic Times\",\"date\":\"2025-01-10\"}]");
            r.setNewsOverallSentiment("POSITIVE");
            r.setECourtsCaseCount(0);
            r.setDgftAlerts("None");
            r.setSebiWatchlist(false);
            r.setLitigationNote("Routine operational disputes. Impeccable legal and compliance standing.");
            r.setCibilScore(820);
            r.setCibilOutstandingLoans(80);
            r.setCibilOverdueAccounts(0);
            r.setCibilGrade("A+");
            r.setSectorName(t.industry());
            r.setSectorHeadwind("Asset quality exceptionally strong: GNPA ~1.5% - 1.7%. Yield Focus: Diversified Retail/Corp. AUM: ~₹1,85,000+ Cr, Branches: Systemic Presence.");
            r.setRbiPolicyNote("Capital Adequacy Ratio (CRAR) between 17.5% and 18.5%. AAA Credit Rating.");
            r.setSectorGrowthPct(12.0);
            r.setCrawlSource("SEEDED");
            researchRepo.save(r);
            return;
        }

        String[] positiveNews = switch (t.industry()) {
            case "IT Services" -> new String[] {
                    t.name().split(" ")[0] + " bags $2M contract with UAE government for digital services",
                    "Indian IT sector posts 11.4% YoY growth, outpacing global peers",
                    "RBI digital payments push boosts demand for fintech consulting"
            };
            case "Pharmaceuticals" -> new String[] {
                    t.name().split(" ")[0] + " API plant receives USFDA clearance, export orders surge",
                    "India pharma export target $65Bn by FY28 — strong sector tailwind",
                    "Generic drug demand in EU creates opportunity for Indian manufacturers"
            };
            case "Manufacturing" -> new String[] {
                    "Indian manufacturing PMI at 56.4 — 14-month high",
                    "PLI scheme disbursements accelerate for MSME sector",
                    t.name().split(" ")[0] + " secures ₹15Cr govt order for capital goods"
            };
            case "Renewable Energy" -> new String[] {
                    t.name().split(" ")[0] + " commissions 50MW solar plant in Rajasthan ahead of schedule",
                    "India's renewable capacity target 500GW by 2030 — massive capex pipeline",
                    "Green hydrogen policy creates new revenue streams for energy companies"
            };
            case "Food Processing" -> new String[] {
                    "India seafood exports hit record $8.1Bn — strong demand from EU, USA",
                    t.name().split(" ")[0] + " receives APEDA quality certification for FY25",
                    "PMFME scheme extends ₹10Cr credit support to food processors"
            };
            default -> new String[] {
                    "Sector showing resilient growth despite global headwinds",
                    t.name().split(" ")[0] + " wins industry award for operational excellence",
                    "RBI repo rate stable at 6.5% — benign credit environment"
            };
        };
        String[] negativeNews = switch (t.industry()) {
            case "Import/Export" -> new String[] {
                    "US anti-dumping duty on Indian textile imports — margin pressure",
                    t.name().split(" ")[0] + " faces DRI probe for alleged over-invoicing of imports",
                    "Rupee depreciation increases import cost by 6% YTD"
            };
            case "Agribusiness" -> new String[] {
                    "Kharif crop shortfall may hit agro-processing margins by 15%",
                    "APMC mandi shutdowns disrupt supply chain in UP, Bihar",
                    t.name().split(" ")[0] + " faces labour union dispute at primary processing unit"
            };
            case "Infrastructure" -> new String[] {
                    "NHAI land acquisition delays push project completion timelines by 18 months",
                    "Interest rate sensitivity dents infrastructure sector valuations",
                    "Slow govt payment cycle averaging 240 days creates working capital stress"
            };
            default -> new String[] {};
        };

        boolean hasNegative = negativeNews.length > 0;
        String newsJson = buildNewsJson(positiveNews, hasNegative ? negativeNews : new String[0]);
        String sentiment = hasNegative ? "NEUTRAL" : "POSITIVE";
        if (t.hasCircular())
            sentiment = "NEGATIVE";

        int cibil = switch (t.riskBand()) {
            case "LOW" -> 720 + (int) (Math.random() * 40);
            case "HIGH" -> 600 + (int) (Math.random() * 60);
            default -> 670 + (int) (Math.random() * 40);
        };
        String cibilGrade = cibil >= 720 ? "A" : cibil >= 680 ? "B" : cibil >= 640 ? "C" : "D";

        WebResearchResult r = new WebResearchResult();
        r.setApplicationId(appId);
        r.setMcaCin(t.cin());
        r.setMcaRegisteredDate("20" + (10 + (int) (Math.random() * 13)) + "-"
                + String.format("%02d", 1 + (int) (Math.random() * 12)) + "-01");
        r.setMcaPaidUpCapital("₹ " + (50 + (int) (Math.random() * 200)) + " Lakhs");
        r.setMcaDirectorCount(2 + (int) (Math.random() * 5));
        r.setMcaFilingStatus(
                t.riskBand().equals("HIGH") ? "Delayed (AOC-4 filed 45 days late)" : "Compliant (AOC-4 filed on time)");
        r.setMcaActive(true);
        r.setNewsItemsJson(newsJson);
        r.setNewsOverallSentiment(sentiment);
        r.setECourtsCaseCount(t.legalConcerns() ? 2 : 0);
        r.setDgftAlerts(t.hasCircular() ? "Alert: Possible mis-declaration of import value" : "None");
        r.setSebiWatchlist(false);
        r.setLitigationNote(t.legalConcerns()
                ? "2 active cases on eCourts: GST dispute FY22 (₹40L) + labour court matter filed 2021."
                : "No active litigation found on eCourts portal as of latest crawl.");
        r.setCibilScore(cibil);
        r.setCibilOutstandingLoans(1 + (int) (Math.random() * 3));
        r.setCibilOverdueAccounts(t.riskBand().equals("HIGH") ? 1 : 0);
        r.setCibilGrade(cibilGrade);
        r.setSectorName(t.industry());
        r.setSectorHeadwind(hasNegative ? negativeNews[0] : "No major sector headwinds identified.");
        r.setRbiPolicyNote(
                "Repo rate at 6.5% — stable credit environment. MSME lending targets revised upward in FY25 budget.");
        r.setSectorGrowthPct(switch (t.industry()) {
            case "IT Services" -> 11.4;
            case "Pharmaceuticals" -> 9.8;
            case "Renewable Energy" -> 24.6;
            case "Food Processing" -> 7.3;
            case "Manufacturing" -> 8.1;
            case "Import/Export" -> 3.2;
            case "Infrastructure" -> 5.9;
            default -> 6.5;
        });
        r.setCrawlSource("SEEDED");
        researchRepo.save(r);
    }

    private String buildNewsJson(String[] positive, String[] negative) {
        StringBuilder sb = new StringBuilder("[");
        String[] sources = { "Economic Times", "Business Standard", "Mint", "Reuters India", "The Hindu BusinessLine" };
        String[] dates = { "2025-11-12", "2025-10-28", "2025-12-01", "2025-09-15", "2026-01-08" };
        int idx = 0;
        for (String h : positive) {
            if (idx > 0)
                sb.append(",");
            sb.append(
                    String.format("{\"headline\":\"%s\",\"sentiment\":\"POSITIVE\",\"source\":\"%s\",\"date\":\"%s\"}",
                            h.replace("\"", "'"), sources[idx % sources.length], dates[idx % dates.length]));
            idx++;
        }
        for (String h : negative) {
            sb.append(",");
            sb.append(
                    String.format("{\"headline\":\"%s\",\"sentiment\":\"NEGATIVE\",\"source\":\"%s\",\"date\":\"%s\"}",
                            h.replace("\"", "'"), sources[idx % sources.length], dates[idx % dates.length]));
            idx++;
        }
        sb.append("]");
        return sb.toString();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static BigDecimal bdOf(double v) {
        return BigDecimal.valueOf(Math.round(v * 100)).movePointLeft(2);
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private void seedUsers() {
        log.info("DataSeeder: checking users...");
        String password = encoder.encode("password");

        createUser("System Admin", "admin@test.com", Role.ADMIN, password);
        createUser("Credit Officer Jane", "credit@test.com", Role.CREDIT_OFFICER, password);
        createUser("Risk Analyst Bob", "analyst@test.com", Role.RISK_ANALYST, password);
        createUser("Credit Manager Alice", "manager@test.com", Role.CREDIT_MANAGER, password);
        createUser("Compliance Officer Tom", "compliance@test.com", Role.COMPLIANCE_OFFICER, password);
        createUser("Viewer Vendor", "viewer@test.com", Role.VIEWER, password);
    }

    private void createUser(String name, String email, Role role, String password) {
        if (userRepo.findByEmail(email).isPresent()) {
            log.debug("DataSeeder: User {} already exists.", email);
            return;
        }
        UserDetailsEntity u = new UserDetailsEntity();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(password);
        u.setRole(role);
        userRepo.save(u);
        log.info("DataSeeder: Created user: {}", email);
    }

    private void seedScores(Long appId, AppTemplate t, Random rng) {
        CreditScore s = new CreditScore();
        s.setApplicationId(appId);

        int base = switch (t.riskBand()) {
            case "LOW" -> 85;
            case "HIGH" -> 45;
            default -> 65;
        };
        s.setCharacter(base + rng.nextInt(15));
        s.setCapacity(base - 5 + rng.nextInt(20));
        s.setCapital(base - 10 + rng.nextInt(25));
        s.setCollateral(base + rng.nextInt(10));
        s.setConditions(base + (t.industry().equals("Renewable Energy") ? 10 : -10) + rng.nextInt(10));

        int total = (s.getCharacter() + s.getCapacity() + s.getCapital() + s.getCollateral() + s.getConditions()) / 5;
        s.setTotalScore(total);
        s.setDecision(t.decision().equals("APPROVED") ? CreditScore.Decision.APPROVE
                : t.decision().equals("REJECTED") ? CreditScore.Decision.REJECT : CreditScore.Decision.FURTHER_REVIEW);

        double limit = t.revenueBaseLakh() * 10 * 100_000 * (total / 100.0);
        s.setRecommendedLimit(bdOf(limit));
        s.setRecommendedRate(bdOf(9.5 + (100 - total) * 0.1));
        s.setExplainability("Overall assessment is " + t.riskBand() + ". " +
                (s.getCharacter() < 50 ? "Weak character scores due to litigation." : "Strong management profile.") +
                " Capacity utilization is " + t.capacityPct() + "%.");
        scoreRepo.save(s);
    }

    private void seedRulesConfig() {
        if (rulesRepo.count() > 0) {
            log.info("DataSeeder: Rules configuration already exists.");
            return;
        }
        log.info("DataSeeder: seeding default rules configuration...");
        RulesConfig config = new RulesConfig();
        config.setGstVarianceThreshold(0.15);
        config.setMaxAutoApprovalLoanAmount(5_000_000.0);
        config.setCibilCheckRequired(true);
        config.setForceOtpLogin(false);
        String envUrl = System.getenv("ML_SERVICE_URL");
        config.setMlServiceUrl(envUrl != null ? envUrl : "http://localhost:8000");
        rulesRepo.save(config);
    }
}
