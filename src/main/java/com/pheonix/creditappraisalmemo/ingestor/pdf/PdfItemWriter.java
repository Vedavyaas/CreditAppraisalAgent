package com.pheonix.creditappraisalmemo.ingestor.pdf;

import com.pheonix.creditappraisalmemo.domain.Document;
import com.pheonix.creditappraisalmemo.domain.DocumentRepository;
import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.batch.infrastructure.item.ItemWriter;

public class PdfItemWriter implements ItemWriter<Document> {

    private final DocumentRepository documentRepository;

    public PdfItemWriter(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Override
    public void write(Chunk<? extends Document> chunk) {
        documentRepository.saveAll(chunk.getItems());
    }
}
