package com.pheonix.creditappraisalmemo.ingestor.gst;

import com.pheonix.creditappraisalmemo.domain.GstEntry;
import com.pheonix.creditappraisalmemo.domain.GstEntryRepository;
import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.batch.infrastructure.item.ItemWriter;

public class GstItemWriter implements ItemWriter<GstEntry> {

    private final GstEntryRepository repository;

    public GstItemWriter(GstEntryRepository repository) {
        this.repository = repository;
    }

    @Override
    public void write(Chunk<? extends GstEntry> chunk) {
        repository.saveAll(chunk.getItems());
    }
}
