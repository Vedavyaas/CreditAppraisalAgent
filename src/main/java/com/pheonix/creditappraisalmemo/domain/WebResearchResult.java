package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores secondary research findings for a credit application.
 * These are produced by the "Research Agent" pillar of the Intelli-Credit engine:
 * MCA filings, news sentiment, eCourts litigation, CIBIL summary, sector outlook.
 *
 * Populated by:
 *  - DataSeeder (seed data for all 8 demo companies)
 *  - Future: real web-crawl agent (Selenium/Playwright + NLP)
 */
@Entity
@Table(name = "web_research_results")
public class WebResearchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long applicationId;

    // ── MCA Filing ─────────────────────────────────────────────────────────
    private String mcaCin;
    private String mcaRegisteredDate;
    private String mcaPaidUpCapital;
    private Integer mcaDirectorCount;
    private String mcaFilingStatus;   // "Compliant" / "Delayed" / "Defaulter"
    private boolean mcaActive;

    // ── News Intelligence ──────────────────────────────────────────────────
    /** JSON array of news items: [{headline, source, date, sentiment}] */
    @Column(length = 4000)
    private String newsItemsJson;

    /** Overall news sentiment: POSITIVE / NEUTRAL / NEGATIVE */
    private String newsOverallSentiment;

    // ── Litigation (eCourts) ────────────────────────────────────────────────
    private Integer eCourtsCaseCount;
    private String dgftAlerts;
    private boolean sebiWatchlist;
    @Column(length = 500)
    private String litigationNote;

    // ── CIBIL Commercial ───────────────────────────────────────────────────
    private Integer cibilScore;
    private Integer cibilOutstandingLoans;
    private Integer cibilOverdueAccounts;
    private String cibilGrade;         // A / B / C / D

    // ── Sector Outlook ─────────────────────────────────────────────────────
    private String sectorName;
    @Column(length = 500)
    private String sectorHeadwind;
    @Column(length = 500)
    private String rbiPolicyNote;
    private Double sectorGrowthPct;

    // ── Metadata ───────────────────────────────────────────────────────────
    private LocalDateTime crawledAt;
    private String crawlSource;   // "SEEDED" / "LIVE_CRAWL"

    @PrePersist
    void onSave() { if (this.crawledAt == null) this.crawledAt = LocalDateTime.now(); }

    // ── Getters & Setters ──────────────────────────────────────────────────
    public Long getId() { return id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long v) { this.applicationId = v; }
    public String getMcaCin() { return mcaCin; }
    public void setMcaCin(String v) { this.mcaCin = v; }
    public String getMcaRegisteredDate() { return mcaRegisteredDate; }
    public void setMcaRegisteredDate(String v) { this.mcaRegisteredDate = v; }
    public String getMcaPaidUpCapital() { return mcaPaidUpCapital; }
    public void setMcaPaidUpCapital(String v) { this.mcaPaidUpCapital = v; }
    public Integer getMcaDirectorCount() { return mcaDirectorCount; }
    public void setMcaDirectorCount(Integer v) { this.mcaDirectorCount = v; }
    public String getMcaFilingStatus() { return mcaFilingStatus; }
    public void setMcaFilingStatus(String v) { this.mcaFilingStatus = v; }
    public boolean isMcaActive() { return mcaActive; }
    public void setMcaActive(boolean v) { this.mcaActive = v; }
    public String getNewsItemsJson() { return newsItemsJson; }
    public void setNewsItemsJson(String v) { this.newsItemsJson = v; }
    public String getNewsOverallSentiment() { return newsOverallSentiment; }
    public void setNewsOverallSentiment(String v) { this.newsOverallSentiment = v; }
    public Integer getECourtsCaseCount() { return eCourtsCaseCount; }
    public void setECourtsCaseCount(Integer v) { this.eCourtsCaseCount = v; }
    public String getDgftAlerts() { return dgftAlerts; }
    public void setDgftAlerts(String v) { this.dgftAlerts = v; }
    public boolean isSebiWatchlist() { return sebiWatchlist; }
    public void setSebiWatchlist(boolean v) { this.sebiWatchlist = v; }
    public String getLitigationNote() { return litigationNote; }
    public void setLitigationNote(String v) { this.litigationNote = v; }
    public Integer getCibilScore() { return cibilScore; }
    public void setCibilScore(Integer v) { this.cibilScore = v; }
    public Integer getCibilOutstandingLoans() { return cibilOutstandingLoans; }
    public void setCibilOutstandingLoans(Integer v) { this.cibilOutstandingLoans = v; }
    public Integer getCibilOverdueAccounts() { return cibilOverdueAccounts; }
    public void setCibilOverdueAccounts(Integer v) { this.cibilOverdueAccounts = v; }
    public String getCibilGrade() { return cibilGrade; }
    public void setCibilGrade(String v) { this.cibilGrade = v; }
    public String getSectorName() { return sectorName; }
    public void setSectorName(String v) { this.sectorName = v; }
    public String getSectorHeadwind() { return sectorHeadwind; }
    public void setSectorHeadwind(String v) { this.sectorHeadwind = v; }
    public String getRbiPolicyNote() { return rbiPolicyNote; }
    public void setRbiPolicyNote(String v) { this.rbiPolicyNote = v; }
    public Double getSectorGrowthPct() { return sectorGrowthPct; }
    public void setSectorGrowthPct(Double v) { this.sectorGrowthPct = v; }
    public LocalDateTime getCrawledAt() { return crawledAt; }
    public void setCrawledAt(LocalDateTime v) { this.crawledAt = v; }
    public String getCrawlSource() { return crawlSource; }
    public void setCrawlSource(String v) { this.crawlSource = v; }
}
