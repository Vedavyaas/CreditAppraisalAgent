package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByApplicationId(Long applicationId);
    List<Document> findByApplicationIdAndType(Long applicationId, Document.DocumentType type);
    List<Document> findByExtractionStatus(Document.ExtractionStatus status);
}
