package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "gst_entries")
public class GstEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    /** e.g. "2024-Q1", "2023-04" */
    private String period;

    /** Turnover declared in GSTR-3B (self-declared, outward supplies) */
    @Column(precision = 20, scale = 2)
    private BigDecimal gstr3bTurnover;

    /** Turnover auto-populated in GSTR-2A (from counter-party GSTR-1) */
    @Column(precision = 20, scale = 2)
    private BigDecimal gstr2aTurnover;

    /**
     * Absolute difference between 3B and 2A.
     * Populated by GstAnalysisService.
     */
    @Column(precision = 20, scale = 2)
    private BigDecimal difference;

    /**
     * Set true when difference > 15% of gstr3bTurnover —
     * indicates potential circular trading / revenue inflation.
     */
    private boolean circularTradingFlag;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public BigDecimal getGstr3bTurnover() { return gstr3bTurnover; }
    public void setGstr3bTurnover(BigDecimal gstr3bTurnover) { this.gstr3bTurnover = gstr3bTurnover; }

    public BigDecimal getGstr2aTurnover() { return gstr2aTurnover; }
    public void setGstr2aTurnover(BigDecimal gstr2aTurnover) { this.gstr2aTurnover = gstr2aTurnover; }

    public BigDecimal getDifference() { return difference; }
    public void setDifference(BigDecimal difference) { this.difference = difference; }

    public boolean isCircularTradingFlag() { return circularTradingFlag; }
    public void setCircularTradingFlag(boolean circularTradingFlag) { this.circularTradingFlag = circularTradingFlag; }
}
