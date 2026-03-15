package com.pheonix.creditappraisalmemo.ingestor.pdf;

import com.pheonix.creditappraisalmemo.domain.Document;
import com.pheonix.creditappraisalmemo.domain.DocumentRepository;
import org.springframework.batch.infrastructure.item.ItemReader;

import java.util.Iterator;
import java.util.List;

/**
 * Reads Document records that are PENDING extraction for a given application.
 * Each document (file path) is yielded individually to the processor.
 */
public class PdfDocumentReader implements ItemReader<Document> {

    private final Iterator<Document> iterator;

    public PdfDocumentReader(Long documentId, DocumentRepository documentRepository) {
        List<Document> pending = new java.util.ArrayList<>();
        documentRepository.findById(documentId).ifPresent(pending::add);
        this.iterator = pending.iterator();
    }

    @Override
    public Document read() {
        return iterator.hasNext() ? iterator.next() : null;
    }
}
