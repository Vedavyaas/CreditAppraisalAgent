package com.pheonix.creditappraisalmemo.controller;

import com.pheonix.creditappraisalmemo.aspect.AuditAction;
import com.pheonix.creditappraisalmemo.domain.QualitativeNote;
import com.pheonix.creditappraisalmemo.domain.QualitativeNoteRepository;
import com.pheonix.creditappraisalmemo.service.MlClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles Credit Officer primary due diligence (DDQ) note submission.
 * Calls Python ML to compute qualitative score adjustment on save.
 */
@RestController
@RequestMapping("/api/applications/{applicationId}/due-diligence")
public class DueDiligenceController {

    private final QualitativeNoteRepository noteRepository;
    private final MlClientService mlClientService;

    public DueDiligenceController(QualitativeNoteRepository noteRepository,
                                   MlClientService mlClientService) {
        this.noteRepository = noteRepository;
        this.mlClientService = mlClientService;
    }

    /** GET — fetch existing notes for this application */
    @AuditAction("Retrieved primary due diligence notes for application")
    @PreAuthorize("hasAnyRole('CREDIT_OFFICER','RISK_ANALYST','CREDIT_MANAGER','COMPLIANCE_OFFICER','ADMIN')")
    @GetMapping
    public ResponseEntity<QualitativeNote> getNotes(@PathVariable Long applicationId) {
        return noteRepository.findByApplicationId(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST/PUT — save or update Credit Officer notes */
    @AuditAction("Credit Officer submitted primary due diligence notes")
    @PreAuthorize("hasAnyRole('CREDIT_OFFICER','ADMIN')")
    @PostMapping
    public ResponseEntity<QualitativeNote> saveNotes(
            @PathVariable Long applicationId,
            @RequestBody QualitativeNote incoming) {

        QualitativeNote note = noteRepository.findByApplicationId(applicationId)
                .orElse(new QualitativeNote());

        note.setApplicationId(applicationId);
        note.setSiteVisitObservations(incoming.getSiteVisitObservations());
        note.setManagementInterviewNotes(incoming.getManagementInterviewNotes());
        note.setCapacityUtilizationPct(incoming.getCapacityUtilizationPct());
        note.setPromoterAssessment(incoming.getPromoterAssessment());
        note.setLegalConcernsNoted(incoming.getLegalConcernsNoted());

        // Call Python qualitative model for score adjustment
        Map<String, Object> result = mlClientService.predictQualitative(
                applicationId,
                incoming.getCapacityUtilizationPct() != null ? incoming.getCapacityUtilizationPct() : 70,
                incoming.getPromoterAssessment() != null ? incoming.getPromoterAssessment() : "NEUTRAL",
                incoming.getLegalConcernsNoted() != null && !incoming.getLegalConcernsNoted().isBlank(),
                incoming.getSiteVisitObservations() != null ? incoming.getSiteVisitObservations() : "",
                incoming.getManagementInterviewNotes() != null ? incoming.getManagementInterviewNotes() : ""
        );

        note.setQualitativeScoreAdjustment((Double) result.getOrDefault("score_adjustment", 0.0));
        note.setOverallSentiment((String) result.getOrDefault("sentiment", "NEUTRAL"));

        return ResponseEntity.ok(noteRepository.save(note));
    }
}
