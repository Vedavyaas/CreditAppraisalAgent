package com.pheonix.creditappraisalmemo.ingestor.bank;

import com.pheonix.creditappraisalmemo.domain.BankTransaction;
import com.pheonix.creditappraisalmemo.domain.BankTransactionRepository;
import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.batch.infrastructure.item.ItemWriter;

public class BankItemWriter implements ItemWriter<BankTransaction> {

    private final BankTransactionRepository repository;

    public BankItemWriter(BankTransactionRepository repository) {
        this.repository = repository;
    }

    @Override
    public void write(Chunk<? extends BankTransaction> chunk) {
        repository.saveAll(chunk.getItems());
    }
}
