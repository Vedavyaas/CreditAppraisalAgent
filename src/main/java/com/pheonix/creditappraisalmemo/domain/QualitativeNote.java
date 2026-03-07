package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores qualitative primary due diligence notes entered by the Credit Officer
 * after factory visits and management interviews.
 * These notes are fed to the Python ML service to adjust the final risk score.
 */
@Entity
@Table(name = "qualitative_notes")
public class QualitativeNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    /** Factory/site visit observations */
    @Column(length = 2000)
    private String siteVisitObservations;

    /** Management interview notes */
    @Column(length = 2000)
    private String managementInterviewNotes;

    /** Capacity utilization observed on-site (0–100%) */
    private Integer capacityUtilizationPct;

    /** Promoter background assessment: STRONG / NEUTRAL / CONCERNING */
    private String promoterAssessment;

    /** Any legal or regulatory issues noted during visit */
    @Column(length = 1000)
    private String legalConcernsNoted;

    /** Overall qualitative risk adjustment (-20 to +20) computed by Python */
    private Double qualitativeScoreAdjustment;

    /** Sentiment of site visit notes: POSITIVE / NEUTRAL / NEGATIVE */
    private String overallSentiment;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private String submittedBy;

    @PrePersist
    void onSave() {
        this.submittedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ────────────────────────────────────────────────────
    public Long getId() { return id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long v) { this.applicationId = v; }
    public String getSiteVisitObservations() { return siteVisitObservations; }
    public void setSiteVisitObservations(String v) { this.siteVisitObservations = v; }
    public String getManagementInterviewNotes() { return managementInterviewNotes; }
    public void setManagementInterviewNotes(String v) { this.managementInterviewNotes = v; }
    public Integer getCapacityUtilizationPct() { return capacityUtilizationPct; }
    public void setCapacityUtilizationPct(Integer v) { this.capacityUtilizationPct = v; }
    public String getPromoterAssessment() { return promoterAssessment; }
    public void setPromoterAssessment(String v) { this.promoterAssessment = v; }
    public String getLegalConcernsNoted() { return legalConcernsNoted; }
    public void setLegalConcernsNoted(String v) { this.legalConcernsNoted = v; }
    public Double getQualitativeScoreAdjustment() { return qualitativeScoreAdjustment; }
    public void setQualitativeScoreAdjustment(Double v) { this.qualitativeScoreAdjustment = v; }
    public String getOverallSentiment() { return overallSentiment; }
    public void setOverallSentiment(String v) { this.overallSentiment = v; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public String getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(String v) { this.submittedBy = v; }
}
