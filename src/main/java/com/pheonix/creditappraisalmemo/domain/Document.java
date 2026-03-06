package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType type;

    @Column(nullable = false)
    private String fileName;

    private String filePath;

    @Column(columnDefinition = "TEXT")
    private String extractedText;   // raw text pulled out by PDFBox

    @Enumerated(EnumType.STRING)
    private ExtractionStatus extractionStatus = ExtractionStatus.PENDING;

    private LocalDateTime uploadedAt;

    public enum DocumentType {
        ANNUAL_REPORT,
        GST_RETURN,
        BANK_STATEMENT,
        LEGAL_NOTICE,
        SANCTION_LETTER,
        BOARD_MINUTES,
        RATING_REPORT,
        SHAREHOLDING_PATTERN,
        OTHER
    }

    public enum ExtractionStatus {
        PENDING, IN_PROGRESS, DONE, FAILED
    }

    @PrePersist
    void onCreate() { this.uploadedAt = LocalDateTime.now(); }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public DocumentType getType() { return type; }
    public void setType(DocumentType type) { this.type = type; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public ExtractionStatus getExtractionStatus() { return extractionStatus; }
    public void setExtractionStatus(ExtractionStatus extractionStatus) { this.extractionStatus = extractionStatus; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
}
