package com.pheonix.creditappraisalmemo.controller;

import com.pheonix.creditappraisalmemo.aspect.AuditAction;
import com.pheonix.creditappraisalmemo.domain.*;
import com.pheonix.creditappraisalmemo.service.AutomatedReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationDataController {

    private final GstEntryRepository            gstRepo;
    private final BankTransactionRepository     bankRepo;
    private final AutomatedReportService        reportService;
    private final CreditApplicationRepository   appRepo;
    private final WebResearchRepository         researchRepo;
    private final DocumentRepository            docRepo;

    public ApplicationDataController(GstEntryRepository gstRepo,
                                     BankTransactionRepository bankRepo,
                                     AutomatedReportService reportService,
                                     CreditApplicationRepository appRepo,
                                     WebResearchRepository researchRepo,
                                     DocumentRepository docRepo) {
        this.gstRepo      = gstRepo;
        this.bankRepo     = bankRepo;
        this.reportService = reportService;
        this.appRepo      = appRepo;
        this.researchRepo = researchRepo;
        this.docRepo      = docRepo;
    }

    /** List all credit applications — used by DD picker and portfolio views */
    @AuditAction("Listed all credit applications")
    @PreAuthorize("hasAnyRole('CREDIT_OFFICER','RISK_ANALYST','CREDIT_MANAGER','COMPLIANCE_OFFICER','ADMIN')")
    @GetMapping
    public ResponseEntity<List<CreditApplication>> listAll() {
        return ResponseEntity.ok(appRepo.findAll());
    }

    /** GST entries for an application */
    @AuditAction("Retrieved GST historical returns data")
    @GetMapping("/{applicationId}/gst")
    public ResponseEntity<List<GstEntry>> getGst(@PathVariable Long applicationId) {
        return ResponseEntity.ok(gstRepo.findAll().stream()
                .filter(g -> applicationId.equals(g.getApplicationId())).toList());
    }

    /** Bank transactions for an application */
    @AuditAction("Retrieved detailed bank transaction ledger")
    @GetMapping("/{applicationId}/bank")
    public ResponseEntity<List<BankTransaction>> getBank(@PathVariable Long applicationId) {
        return ResponseEntity.ok(bankRepo.findAll().stream()
                .filter(b -> applicationId.equals(b.getApplicationId())).toList());
    }

    /** Automated ML report */
    @AuditAction("Generated automated synthesis & risk appraisal report")
    @GetMapping("/{applicationId}/automated-report")
    public ResponseEntity<AutomatedReportDTO> getReport(@PathVariable Long applicationId) {
        return ResponseEntity.ok(reportService.generateReport(applicationId));
    }

    /**
     * Research Agent results — MCA, news, eCourts, CIBIL, sector outlook.
     * Served from DB (seeded on startup; future: live crawl agent).
     */
    @AuditAction("Retrieved secondary research agent findings")
    @PreAuthorize("hasAnyRole('RISK_ANALYST','CREDIT_MANAGER','COMPLIANCE_OFFICER','ADMIN')")
    @GetMapping("/{applicationId}/research")
    public ResponseEntity<WebResearchResult> getResearch(@PathVariable Long applicationId) {
        return researchRepo.findByApplicationId(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Documents for an application */
    @AuditAction("Retrieved uploaded application documents")
    @GetMapping("/{applicationId}/documents")
    public ResponseEntity<List<Document>> getDocuments(@PathVariable Long applicationId) {
        return ResponseEntity.ok(docRepo.findAll().stream()
                .filter(d -> applicationId.equals(d.getApplicationId())).toList());
    }

    /** Update compliance status */
    @AuditAction("Updated application compliance state")
    @PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER','ADMIN')")
    @PutMapping("/{id}/compliance")
    public ResponseEntity<CreditApplication> updateCompliance(@PathVariable Long id, 
                                                               @RequestParam String status,
                                                               @RequestParam String appStatus) {
        return appRepo.findById(id).map(app -> {
            app.setComplianceStatus(status);
            app.setStatus(CreditApplication.ApplicationStatus.valueOf(appStatus));
            return ResponseEntity.ok(appRepo.save(app));
        }).orElse(ResponseEntity.notFound().build());
    }
}
