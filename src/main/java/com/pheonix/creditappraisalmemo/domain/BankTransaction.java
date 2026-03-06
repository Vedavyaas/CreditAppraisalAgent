package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bank_transactions")
public class BankTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    private LocalDate transactionDate;

    private String description;

    @Column(precision = 20, scale = 2)
    private BigDecimal credit;

    @Column(precision = 20, scale = 2)
    private BigDecimal debit;

    @Column(precision = 20, scale = 2)
    private BigDecimal balance;

    /**
     * Flagged when a round-sum credit and matching debit occur on the
     * same day (classic circular transaction pattern).
     */
    private boolean suspiciousFlag;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getCredit() { return credit; }
    public void setCredit(BigDecimal credit) { this.credit = credit; }

    public BigDecimal getDebit() { return debit; }
    public void setDebit(BigDecimal debit) { this.debit = debit; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public boolean isSuspiciousFlag() { return suspiciousFlag; }
    public void setSuspiciousFlag(boolean suspiciousFlag) { this.suspiciousFlag = suspiciousFlag; }
}
