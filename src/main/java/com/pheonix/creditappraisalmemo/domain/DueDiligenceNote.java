package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "due_diligence_notes")
public class DueDiligenceNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NoteCategory category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String note;

    /**
     * AI-computed adjustment to the final credit score.
     * Range: -10 (very negative signal) to +10 (very positive signal).
     * Null until processed by AiAnalysisService.
     */
    private Double aiRiskAdjustment;

    private String createdBy;   // email of the Credit Officer
    private LocalDateTime createdAt;

    public enum NoteCategory {
        FACTORY_VISIT,
        MANAGEMENT_INTERVIEW,
        SITE_OBSERVATION,
        PROMOTER_BACKGROUND,
        OTHER
    }

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public NoteCategory getCategory() { return category; }
    public void setCategory(NoteCategory category) { this.category = category; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Double getAiRiskAdjustment() { return aiRiskAdjustment; }
    public void setAiRiskAdjustment(Double aiRiskAdjustment) { this.aiRiskAdjustment = aiRiskAdjustment; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
