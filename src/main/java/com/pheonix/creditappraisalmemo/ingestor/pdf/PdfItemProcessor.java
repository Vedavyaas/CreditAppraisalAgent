package com.pheonix.creditappraisalmemo.ingestor.pdf;

import com.pheonix.creditappraisalmemo.domain.Document;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.batch.infrastructure.item.ItemProcessor;

import java.io.File;

/**
 * Uses Apache PDFBox to extract all text from a PDF file.
 * Marks the document as IN_PROGRESS before processing and DONE after.
 * On failure the document is marked FAILED so downstream can skip/retry.
 */
public class PdfItemProcessor implements ItemProcessor<Document, Document> {

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

            try (PDDocument pdf = Loader.loadPDF(file)) {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(pdf);
                doc.setExtractedText(text);
                doc.setExtractionStatus(Document.ExtractionStatus.DONE);
            }
        } catch (Exception e) {
            doc.setExtractionStatus(Document.ExtractionStatus.FAILED);
            doc.setExtractedText("[ERROR] " + e.getMessage());
        }
        return doc;
    }
}
