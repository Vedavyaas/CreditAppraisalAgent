package com.pheonix.creditappraisalmemo.ingestor.pdf;

import com.pheonix.creditappraisalmemo.domain.Document;
import com.pheonix.creditappraisalmemo.service.MlClientService;
import org.springframework.batch.infrastructure.item.ItemProcessor;

import java.io.File;

/**
 * Uses Python ML service to extract all text from a PDF file.
 * Marks the document as IN_PROGRESS before processing and DONE after.
 * On failure the document is marked FAILED so downstream can skip/retry.
 */
public class PdfItemProcessor implements ItemProcessor<Document, Document> {

    private final MlClientService mlClientService;

    public PdfItemProcessor(MlClientService mlClientService) {
        this.mlClientService = mlClientService;
    }

    @Override
    public Document process(Document doc) {
        doc.setExtractionStatus(Document.ExtractionStatus.IN_PROGRESS);
        try {
            File file = new File(doc.getFilePath());
            if (!file.exists()) {
                doc.setExtractionStatus(Document.ExtractionStatus.FAILED);
                doc.setExtractedText("[ERROR] File not found: " + doc.getFilePath());
                return doc;
            }

            String text = mlClientService.extractPdf(doc.getFilePath());
            doc.setExtractedText(text);

            if (text != null && text.startsWith("[ERROR]")) {
                doc.setExtractionStatus(Document.ExtractionStatus.FAILED);
            } else {
                doc.setExtractionStatus(Document.ExtractionStatus.DONE);
            }
        } catch (Exception e) {
            doc.setExtractionStatus(Document.ExtractionStatus.FAILED);
            doc.setExtractedText("[ERROR] " + e.getMessage());
        }
        return doc;
    }
}
