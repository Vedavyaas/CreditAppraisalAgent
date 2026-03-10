package com.pheonix.creditappraisalmemo.controller;

import com.pheonix.creditappraisalmemo.aspect.AuditAction;
import com.pheonix.creditappraisalmemo.domain.*;
import com.pheonix.creditappraisalmemo.service.AutomatedReportService;
import com.pheonix.creditappraisalmemo.service.MlClientService;
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
    private final MlClientService               mlClientService;
    private final PersonaSimulationRepository   personaRepo;

    public ApplicationDataController(GstEntryRepository gstRepo,
                                     BankTransactionRepository bankRepo,
                                     AutomatedReportService reportService,
                                     CreditApplicationRepository appRepo,
                                     WebResearchRepository researchRepo,
                                     DocumentRepository docRepo,
                                     MlClientService mlClientService,
                                     PersonaSimulationRepository personaRepo) {
        this.gstRepo      = gstRepo;
        this.bankRepo     = bankRepo;
        this.reportService = reportService;
        this.appRepo      = appRepo;
        this.researchRepo = researchRepo;
        this.docRepo      = docRepo;
        this.mlClientService = mlClientService;
        this.personaRepo  = personaRepo;
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

    /** Create a new credit application */
    @AuditAction("Created a new credit application")
    @PreAuthorize("hasAnyRole('CREDIT_OFFICER','ADMIN')")
    @PostMapping
    public ResponseEntity<Object> createApplication(@RequestBody CreditApplication app) {
        // 🛡️ DUPLICATE CHECK: Prevent multiple concurrent applications for the same company (CIN)
        if (app.getCin() != null && !app.getCin().isBlank()) {
            var existing = appRepo.findByCin(app.getCin());
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("message", "An active credit application already exists for this CIN: " + app.getCin())
                );
            }
        }

        if (app.getCreatedBy() == null) {
            app.setCreatedBy("credit@test.com"); // Default for demo if not provided
        }
        CreditApplication savedApp = appRepo.save(app);

        // 🚀 Background Trigger for Research Crawler
        new Thread(() -> {
            try {
                java.util.Map<String, Object> crawlData = mlClientService.crawlResearch(
                        savedApp.getId(), savedApp.getCompanyName(), savedApp.getCin());
                mlClientService.saveResearch(savedApp.getId(), crawlData);
            } catch (Exception e) {
                // Silently fail or log for demo
            }
        }).start();

        return ResponseEntity.ok(savedApp);
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

    /** Update overall application status (e.g., Credit Manager verifying a MANUAL_REVIEW) */
    @AuditAction("Updated application status decision")
    @PreAuthorize("hasAnyRole('CREDIT_MANAGER','ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<CreditApplication> updateStatus(@PathVariable Long id, 
                                                               @RequestBody java.util.Map<String, String> payload) {
        return appRepo.findById(id).map(app -> {
            String newStatus = payload.get("status");
            app.setStatus(CreditApplication.ApplicationStatus.valueOf(newStatus));
            
            // Sync with ML prediction if the status means a final decision
            if ("DECIDED".equals(newStatus) || "REJECTED".equals(newStatus)) {
                mlClientService.updateFinalConstraints(id, null, "DECIDED".equals(newStatus) ? "APPROVED" : "REJECTED", null);
            }
            
            return ResponseEntity.ok(appRepo.save(app));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    /** Trigger Persona Simulation */
    @AuditAction("Simulated cognitive persona response / Digital Twin generated")
    @PostMapping("/{id}/persona-simulation")
    public ResponseEntity<PersonaSimulationResult> simulatePersona(@PathVariable Long id, @RequestBody java.util.Map<String, Object> qualitativeParams) {
        return appRepo.findById(id).map(app -> {
            int capacity = qualitativeParams.containsKey("capacityUtilization") ? Integer.parseInt(qualitativeParams.get("capacityUtilization").toString()) : 75;
            String assessment = qualitativeParams.containsKey("promoterAssessment") ? qualitativeParams.get("promoterAssessment").toString() : "NEUTRAL";
            boolean legal = qualitativeParams.containsKey("legalConcerns") && Boolean.parseBoolean(qualitativeParams.get("legalConcerns").toString());
            
            PersonaSimulationResult res = mlClientService.simulatePersona(
                app.getId(), app.getCompanyName(), app.getIndustry(), app.getTurnover(),
                capacity, assessment, legal);
             
            if (res == null) return ResponseEntity.internalServerError().<PersonaSimulationResult>build();
            return ResponseEntity.ok(res);
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Retrieve existing Persona Simulation */
    @GetMapping("/{id}/persona-simulation")
    public ResponseEntity<PersonaSimulationResult> getPersonaSimulation(@PathVariable Long id) {
        return personaRepo.findByApplicationId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
