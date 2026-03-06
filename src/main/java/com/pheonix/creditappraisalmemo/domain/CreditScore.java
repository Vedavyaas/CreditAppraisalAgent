package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_scores")
public class CreditScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long applicationId;

    // ── Five C's (each 0–100) ─────────────────────────────────────────────────

    /** Promoter integrity, litigation history, news sentiment */
    private Integer character;

    /** Revenue trend, DSCR proxy, cash-flow consistency */
    private Integer capacity;

    /** Net worth, leverage ratio */
    private Integer capital;

    /** Quality and coverage of collateral offered */
    private Integer collateral;

    /** Macro environment, sector headwinds, RBI/regulatory context */
    private Integer conditions;

    /** Weighted composite (0–100) after DD adjustments */
    private Integer totalScore;

    // ── Decision ──────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    private Decision decision;

    /** Recommended loan limit in INR */
    @Column(precision = 20, scale = 2)
    private BigDecimal recommendedLimit;

    /** Suggested interest rate (e.g. 11.50) */
    @Column(precision = 5, scale = 2)
    private BigDecimal recommendedRate;

    /**
     * Human-readable explanation of the decision.
     * e.g. "Rejected due to high litigation risk (Character: 22/100) despite
     *       strong cash flows (Capacity: 78/100)"
     */
    @Column(columnDefinition = "TEXT")
    private String explainability;

    private LocalDateTime computedAt;

    public enum Decision {
        APPROVE, REJECT, FURTHER_REVIEW
    }

    @PrePersist
    void onCreate() { this.computedAt = LocalDateTime.now(); }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Integer getCharacter() { return character; }
    public void setCharacter(Integer character) { this.character = character; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Integer getCapital() { return capital; }
    public void setCapital(Integer capital) { this.capital = capital; }

    public Integer getCollateral() { return collateral; }
    public void setCollateral(Integer collateral) { this.collateral = collateral; }

    public Integer getConditions() { return conditions; }
    public void setConditions(Integer conditions) { this.conditions = conditions; }

    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }

    public Decision getDecision() { return decision; }
    public void setDecision(Decision decision) { this.decision = decision; }

    public BigDecimal getRecommendedLimit() { return recommendedLimit; }
    public void setRecommendedLimit(BigDecimal recommendedLimit) { this.recommendedLimit = recommendedLimit; }

    public BigDecimal getRecommendedRate() { return recommendedRate; }
    public void setRecommendedRate(BigDecimal recommendedRate) { this.recommendedRate = recommendedRate; }

    public String getExplainability() { return explainability; }
    public void setExplainability(String explainability) { this.explainability = explainability; }

    public LocalDateTime getComputedAt() { return computedAt; }
}
