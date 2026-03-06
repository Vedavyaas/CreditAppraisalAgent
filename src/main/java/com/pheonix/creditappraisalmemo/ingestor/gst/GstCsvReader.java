package com.pheonix.creditappraisalmemo.ingestor.gst;

import com.opencsv.bean.CsvToBeanBuilder;
import org.springframework.batch.infrastructure.item.ItemReader;
import org.springframework.batch.infrastructure.item.NonTransientResourceException;
import org.springframework.batch.infrastructure.item.ParseException;
import org.springframework.batch.infrastructure.item.UnexpectedInputException;

import java.io.FileReader;
import java.util.Iterator;
import java.util.List;

public class GstCsvReader implements ItemReader<GstRowDto> {

    private final Iterator<GstRowDto> iterator;

    public GstCsvReader(String filePath) throws Exception {
        List<GstRowDto> rows = new CsvToBeanBuilder<GstRowDto>(new FileReader(filePath))
                .withType(GstRowDto.class)
                .withIgnoreLeadingWhiteSpace(true)
                .build()
                .parse();
        this.iterator = rows.iterator();
    }

    @Override
    public GstRowDto read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {
        return iterator.hasNext() ? iterator.next() : null;
    }
}
