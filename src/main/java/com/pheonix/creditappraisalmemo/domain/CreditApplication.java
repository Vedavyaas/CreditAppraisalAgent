package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_applications")
public class CreditApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    private String cin;            // Ministry of Corporate Affairs ID
    private String pan;
    private String gstNumber;
    private String industry;
    private String city;
    private Double turnover;

    private String loanType;
    private Integer loanTenure;
    private Double loanInterest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @Column(nullable = false)
    private Double requestedAmount = 0.0;

    private String complianceStatus = "PENDING"; // PENDING, FLAGGED, CLEARED, HOLD
    private String riskBand = "MEDIUM";        // LOW, MEDIUM, HIGH (populated by ML)

    @Column(nullable = false)
    private String createdBy;      // email of the Credit Officer

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void setCompanyAge(double v) {
    }

    public void setRequiredLoanAmount(double v) {

    }

    public enum ApplicationStatus {
        DRAFT, IN_REVIEW, ANALYZING, PENDING_COMPLIANCE, PENDING_MANAGER, DECIDED, REJECTED, FRAUD_FLAGGED
    }

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); this.updatedAt = LocalDateTime.now(); }
    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    public Double getTurnover() { return turnover; }
    public void setTurnover(Double turnover) { this.turnover = turnover; }

    public String getLoanType() { return loanType; }
    public void setLoanType(String loanType) { this.loanType = loanType; }

    public Integer getLoanTenure() { return loanTenure; }
    public void setLoanTenure(Integer loanTenure) { this.loanTenure = loanTenure; }

    public Double getLoanInterest() { return loanInterest; }
    public void setLoanInterest(Double loanInterest) { this.loanInterest = loanInterest; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Double getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(Double requestedAmount) { this.requestedAmount = requestedAmount; }

    public String getComplianceStatus() { return complianceStatus; }
    public void setComplianceStatus(String complianceStatus) { this.complianceStatus = complianceStatus; }

    public String getRiskBand() { return riskBand; }
    public void setRiskBand(String riskBand) { this.riskBand = riskBand; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
