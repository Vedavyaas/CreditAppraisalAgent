package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;

/**
 * Singleton configuration row for the Admin Rules Engine.
 * Always has exactly one row (id = 1).
 * These values influence batch processing, automated decisions, and ML calls.
 */
@Entity
@Table(name = "rules_config")
public class RulesConfig {

    @Id
    private Long id = 1L;

    /** GST circular trading threshold (0.0 to 1.0). Default = 0.15 (15%) */
    @Column(nullable = false)
    private double gstVarianceThreshold = 0.15;

    /**
     * Max loan amount for fully automatic approval (INR).
     * Applications above this go to MANUAL_REVIEW even if risk is OK.
     */
    @Column(nullable = false)
    private double maxAutoApprovalLoanAmount = 5_000_000.0;

    /** Whether CIBIL check is required before processing */
    @Column(nullable = false)
    private boolean cibilCheckRequired = true;

    /** Whether MFA OTP is forced globally */
    @Column(nullable = false)
    private boolean forceOtpLogin = false;

    /** URL of the Python ML microservice */
    @Column(nullable = false)
    private String mlServiceUrl = "http://localhost:8000";

    // ── Getters & Setters ─────────────────────────────────────────────────
    public Long getId() { return id; }

    public double getGstVarianceThreshold() { return gstVarianceThreshold; }
    public void setGstVarianceThreshold(double v) { this.gstVarianceThreshold = v; }

    public double getMaxAutoApprovalLoanAmount() { return maxAutoApprovalLoanAmount; }
    public void setMaxAutoApprovalLoanAmount(double v) { this.maxAutoApprovalLoanAmount = v; }

    public boolean isCibilCheckRequired() { return cibilCheckRequired; }
    public void setCibilCheckRequired(boolean v) { this.cibilCheckRequired = v; }

    public boolean isForceOtpLogin() { return forceOtpLogin; }
    public void setForceOtpLogin(boolean v) { this.forceOtpLogin = v; }

    public String getMlServiceUrl() { return mlServiceUrl; }
    public void setMlServiceUrl(String v) { this.mlServiceUrl = v; }
}
