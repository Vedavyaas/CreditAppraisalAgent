package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cam_reports")
public class CamReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long applicationId;

    /** Absolute path to the generated Word (.docx) file */
    private String reportPath;

    private String reportFileName;

    private LocalDateTime generatedAt;

    @PrePersist
    void onCreate() { this.generatedAt = LocalDateTime.now(); }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getReportPath() { return reportPath; }
    public void setReportPath(String reportPath) { this.reportPath = reportPath; }

    public String getReportFileName() { return reportFileName; }
    public void setReportFileName(String reportFileName) { this.reportFileName = reportFileName; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
}
