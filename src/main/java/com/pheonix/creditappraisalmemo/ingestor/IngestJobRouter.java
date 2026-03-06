package com.pheonix.creditappraisalmemo.ingestor;

import com.pheonix.creditappraisalmemo.domain.Document;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.job.parameters.InvalidJobParametersException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.launch.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.launch.JobRestartException;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Routes an uploaded document to the correct Spring Batch Job
 * based on the document type.
 *
 * JobParameters include a timestamp to ensure each upload creates
 * a unique JobInstance (Batch won't re-run an identical set of params).
 */
@Service
public class IngestJobRouter {

    private final JobLauncher jobLauncher;
    private final Job gstIngestionJob;
    private final Job bankIngestionJob;
    private final Job pdfExtractionJob;

    public IngestJobRouter(JobLauncher jobLauncher,
                           Job gstIngestionJob,
                           Job bankIngestionJob,
                           Job pdfExtractionJob) {
        this.jobLauncher = jobLauncher;
        this.gstIngestionJob = gstIngestionJob;
        this.bankIngestionJob = bankIngestionJob;
        this.pdfExtractionJob = pdfExtractionJob;
    }

    /**
     * Launch the appropriate job and return its execution ID.
     *
     * @param document the saved Document entity (has filePath + applicationId)
     * @return Spring Batch JobExecution ID (use for status polling)
     */
    public Long route(Document document) throws JobExecutionAlreadyRunningException,
            JobRestartException, JobInstanceAlreadyCompleteException, InvalidJobParametersException {

        Job job = pickJob(document.getType());
        if (job == null) return null; // unsupported type — skip silently

        JobParameters params = new JobParametersBuilder()
                .addLong("applicationId", document.getApplicationId())
                .addString("filePath", document.getFilePath())
                .addLong("documentId", document.getId())
                .addLong("runAt", Instant.now().toEpochMilli())  // uniqueness
                .toJobParameters();

        JobExecution execution = jobLauncher.run(job, params);
        return execution.getId();
    }

    private Job pickJob(Document.DocumentType type) {
        if (type == null) return null;
        switch (type) {
            case GST_RETURN: 
                return gstIngestionJob;
            case BANK_STATEMENT: 
                return bankIngestionJob;
            case ANNUAL_REPORT:
            case LEGAL_NOTICE:
            case SANCTION_LETTER:
            case BOARD_MINUTES:
            case RATING_REPORT:
            case SHAREHOLDING_PATTERN:
                return pdfExtractionJob;
            default: 
                return null;
        }
    }
}
