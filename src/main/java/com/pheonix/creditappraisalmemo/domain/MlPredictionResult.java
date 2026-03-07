package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores the ML prediction result for each application (cached in DB).
 * Spring saves this after every /predict/* call so the frontend can read it fast.
 */
@Entity
@Table(name = "ml_prediction_results")
public class MlPredictionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long applicationId;

    // Risk Scorer outputs
    private Double riskScore;
    private String decision;          // APPROVED / MANUAL_REVIEW / REJECTED
    private Double riskConfidence;
    private String riskBand;          // LOW / MEDIUM / HIGH

    // Fraud Detector outputs
    private Double fraudProbability;
    private String fraudProbabilityPct;
    private Boolean isAnomalous;

    // Revenue Forecast outputs
    private String forecastJson;      // JSON array of 3 values
    private String revenueTrend;      // GROWING / STABLE / DECLINING
    private Double growthRatePct;

    // Loan Recommendation outputs
    private Double recommendedMaxLoan;
    private Integer recommendedTenorMonths;
    private Double emiEstimate;
    private String recommendationTier; // PRIME / STANDARD / RESTRICTED

    private LocalDateTime computedAt;

    @PrePersist
    @PreUpdate
    void onSave() { this.computedAt = LocalDateTime.now(); }

    // ── Getters & Setters ────────────────────────────────────────────────────
    public Long getId() { return id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long v) { this.applicationId = v; }
    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double v) { this.riskScore = v; }
    public String getDecision() { return decision; }
    public void setDecision(String v) { this.decision = v; }
    public Double getRiskConfidence() { return riskConfidence; }
    public void setRiskConfidence(Double v) { this.riskConfidence = v; }
    public String getRiskBand() { return riskBand; }
    public void setRiskBand(String v) { this.riskBand = v; }
    public Double getFraudProbability() { return fraudProbability; }
    public void setFraudProbability(Double v) { this.fraudProbability = v; }
    public String getFraudProbabilityPct() { return fraudProbabilityPct; }
    public void setFraudProbabilityPct(String v) { this.fraudProbabilityPct = v; }
    public Boolean getIsAnomalous() { return isAnomalous; }
    public void setIsAnomalous(Boolean v) { this.isAnomalous = v; }
    public String getForecastJson() { return forecastJson; }
    public void setForecastJson(String v) { this.forecastJson = v; }
    public String getRevenueTrend() { return revenueTrend; }
    public void setRevenueTrend(String v) { this.revenueTrend = v; }
    public Double getGrowthRatePct() { return growthRatePct; }
    public void setGrowthRatePct(Double v) { this.growthRatePct = v; }
    public Double getRecommendedMaxLoan() { return recommendedMaxLoan; }
    public void setRecommendedMaxLoan(Double v) { this.recommendedMaxLoan = v; }
    public Integer getRecommendedTenorMonths() { return recommendedTenorMonths; }
    public void setRecommendedTenorMonths(Integer v) { this.recommendedTenorMonths = v; }
    public Double getEmiEstimate() { return emiEstimate; }
    public void setEmiEstimate(Double v) { this.emiEstimate = v; }
    public String getRecommendationTier() { return recommendationTier; }
    public void setRecommendationTier(String v) { this.recommendationTier = v; }
    public LocalDateTime getComputedAt() { return computedAt; }
}
