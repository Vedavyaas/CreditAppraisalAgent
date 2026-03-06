package com.pheonix.creditappraisalmemo.ingestor;

import com.pheonix.creditappraisalmemo.domain.Document;
import com.pheonix.creditappraisalmemo.domain.DocumentRepository;
import org.springframework.batch.core.repository.explore.JobExplorer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ingest")
public class IngestController {

    private final DocumentRepository documentRepository;
    private final IngestJobRouter jobRouter;
    private final JobExplorer jobExplorer;

    @Value("${app.documents.upload-dir:./uploads}")
    private String uploadDir;

    public IngestController(DocumentRepository documentRepository,
                            IngestJobRouter jobRouter,
                            JobExplorer jobExplorer) {
        this.documentRepository = documentRepository;
        this.jobRouter = jobRouter;
        this.jobExplorer = jobExplorer;
    }

    /**
     * POST /api/ingest/{applicationId}/upload
     *
     * Upload a file (PDF, CSV) for a given application.
     * Body: multipart/form-data with fields:
     *   - file: the binary file
     *   - type: DocumentType enum value (e.g. GST_RETURN, BANK_STATEMENT, ANNUAL_REPORT)
     *
     * Returns the jobExecutionId for polling.
     */
    @PostMapping("/{applicationId}/upload")
    public ResponseEntity<Map<String, Object>> upload(
            @PathVariable Long applicationId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") Document.DocumentType type) throws IOException {

        // 1. Save file to disk
        Path dir = Paths.get(uploadDir, String.valueOf(applicationId));
        Files.createDirectories(dir);
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = dir.resolve(fileName);
        file.transferTo(filePath.toFile());

        // 2. Create Document record
        Document doc = new Document();
        doc.setApplicationId(applicationId);
        doc.setType(type);
        doc.setFileName(fileName);
        doc.setFilePath(filePath.toAbsolutePath().toString());
        doc.setExtractionStatus(Document.ExtractionStatus.PENDING);
        documentRepository.save(doc);

        // 3. Launch appropriate Batch job
        Long jobExecutionId = null;
        try {
            jobExecutionId = jobRouter.route(doc);
        } catch (Exception e) {
            Map<String, Object> errorBody = new java.util.HashMap<>();
            errorBody.put("documentId", doc.getId());
            errorBody.put("fileName", fileName);
            errorBody.put("type", type.name());
            errorBody.put("status", "JOB_LAUNCH_FAILED");
            errorBody.put("error", e.getMessage());
            return ResponseEntity.ok(errorBody);
        }

        Map<String, Object> successBody = new java.util.HashMap<>();
        successBody.put("documentId", doc.getId());
        successBody.put("fileName", fileName);
        successBody.put("type", type.name());
        successBody.put("jobExecutionId", jobExecutionId != null ? jobExecutionId : "N/A");
        successBody.put("status", "STARTED");
        return ResponseEntity.ok(successBody);
    }

    /**
     * GET /api/ingest/jobs/{jobExecutionId}/status
     * Poll Spring Batch JobRepository for the current execution state.
     */
    @GetMapping("/jobs/{jobExecutionId}/status")
    public ResponseEntity<Map<String, Object>> jobStatus(@PathVariable Long jobExecutionId) {
        var execution = jobExplorer.getJobExecution(jobExecutionId);
        if (execution == null) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> statusBody = new java.util.HashMap<>();
        statusBody.put("jobExecutionId", jobExecutionId);
        statusBody.put("jobName", execution.getJobInstance().getJobName());
        statusBody.put("status", execution.getStatus().name());
        statusBody.put("exitCode", execution.getExitStatus().getExitCode());
        statusBody.put("exitDescription", execution.getExitStatus().getExitDescription());
        statusBody.put("startTime", String.valueOf(execution.getStartTime()));
        statusBody.put("endTime", String.valueOf(execution.getEndTime()));
        return ResponseEntity.ok(statusBody);
    }

    @GetMapping("/{applicationId}/documents")
    public ResponseEntity<List<Document>> listDocuments(@PathVariable Long applicationId) {
        return ResponseEntity.ok(documentRepository.findByApplicationId(applicationId));
    }

    @GetMapping("/{applicationId}/documents/{docId}/text")
    public ResponseEntity<Map<String, Object>> getExtractedText(
            @PathVariable Long applicationId,
            @PathVariable Long docId) {
        return documentRepository.findById(docId)
                .filter(d -> d.getApplicationId().equals(applicationId))
                .map(d -> {
                    Map<String, Object> body = new java.util.HashMap<>();
                    body.put("documentId", d.getId());
                    body.put("fileName", d.getFileName());
                    body.put("extractionStatus", d.getExtractionStatus().name());
                    body.put("extractedText", d.getExtractedText() != null ? d.getExtractedText() : "");
                    return ResponseEntity.ok(body);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
