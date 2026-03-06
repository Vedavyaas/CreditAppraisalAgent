package com.pheonix.creditappraisalmemo.ingestor.bank;

import com.opencsv.bean.CsvToBeanBuilder;
import org.springframework.batch.infrastructure.item.ItemReader;

import java.io.FileReader;
import java.util.Iterator;
import java.util.List;

public class BankCsvReader implements ItemReader<BankRowDto> {

    private final Iterator<BankRowDto> iterator;

    public BankCsvReader(String filePath) throws Exception {
        List<BankRowDto> rows = new CsvToBeanBuilder<BankRowDto>(new FileReader(filePath))
                .withType(BankRowDto.class)
                .withIgnoreLeadingWhiteSpace(true)
                .build()
                .parse();
        this.iterator = rows.iterator();
    }

    @Override
    public BankRowDto read() {
        return iterator.hasNext() ? iterator.next() : null;
    }
}
