package com.pheonix.creditappraisalmemo.ingestor;

import com.pheonix.creditappraisalmemo.domain.*;
import com.pheonix.creditappraisalmemo.ingestor.bank.*;
import com.pheonix.creditappraisalmemo.ingestor.gst.*;
import com.pheonix.creditappraisalmemo.ingestor.pdf.*;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * Spring Batch Job beans.
 *
 * @StepScope on each Reader/Processor bean means Spring creates a fresh
 * instance per job execution, injecting the runtime JobParameters values
 * (applicationId, filePath).  This is the standard Batch pattern for
 * parameterised, reusable jobs.
 */
@Configuration
public class IngestJobConfig {

    private static final int CHUNK_SIZE = 50;

    private final JobRepository jobRepository;
    private final PlatformTransactionManager txManager;
    private final GstEntryRepository gstEntryRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final DocumentRepository documentRepository;

    public IngestJobConfig(JobRepository jobRepository,
                           PlatformTransactionManager txManager,
                           GstEntryRepository gstEntryRepository,
                           BankTransactionRepository bankTransactionRepository,
                           DocumentRepository documentRepository) {
        this.jobRepository = jobRepository;
        this.txManager = txManager;
        this.gstEntryRepository = gstEntryRepository;
        this.bankTransactionRepository = bankTransactionRepository;
        this.documentRepository = documentRepository;
    }

    // ══════════════════ GST INGESTION JOB ════════════════════════════════════

    @Bean
    public Job gstIngestionJob() {
        return new JobBuilder("gstIngestionJob", jobRepository)
                .start(gstIngestionStep(null, null))
                .build();
    }

    @Bean
    @StepScope
    public Step gstIngestionStep(
            @Value("#{jobParameters['filePath']}") String filePath,
            @Value("#{jobParameters['applicationId']}") Long applicationId) {
        try {
            return new StepBuilder("gstIngestionStep", jobRepository)
                    .<GstRowDto, GstEntry>chunk(CHUNK_SIZE, txManager)
                    .reader(new GstCsvReader(filePath))
                    .processor(new GstItemProcessor(applicationId))
                    .writer(new GstItemWriter(gstEntryRepository))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to build GST step", e);
        }
    }

    // ══════════════════ BANK STATEMENT INGESTION JOB ═════════════════════════

    @Bean
    public Job bankIngestionJob() {
        return new JobBuilder("bankIngestionJob", jobRepository)
                .start(bankIngestionStep(null, null))
                .build();
    }

    @Bean
    @StepScope
    public Step bankIngestionStep(
            @Value("#{jobParameters['filePath']}") String filePath,
            @Value("#{jobParameters['applicationId']}") Long applicationId) {
        try {
            return new StepBuilder("bankIngestionStep", jobRepository)
                    .<BankRowDto, BankTransaction>chunk(CHUNK_SIZE, txManager)
                    .reader(new BankCsvReader(filePath))
                    .processor(new BankItemProcessor(applicationId))
                    .writer(new BankItemWriter(bankTransactionRepository))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to build Bank step", e);
        }
    }

    // ══════════════════ PDF EXTRACTION JOB ═══════════════════════════════════

    @Bean
    public Job pdfExtractionJob() {
        return new JobBuilder("pdfExtractionJob", jobRepository)
                .start(pdfExtractionStep(null))
                .build();
    }

    @Bean
    @StepScope
    public Step pdfExtractionStep(
            @Value("#{jobParameters['applicationId']}") Long applicationId) {
        return new StepBuilder("pdfExtractionStep", jobRepository)
                .<Document, Document>chunk(CHUNK_SIZE, txManager)
                .reader(new PdfDocumentReader(applicationId, documentRepository))
                .processor(new PdfItemProcessor())
                .writer(new PdfItemWriter(documentRepository))
                .build();
    }
}
