package com.pheonix.creditappraisalmemo.controller;

import com.pheonix.creditappraisalmemo.aspect.AuditAction;
import com.pheonix.creditappraisalmemo.domain.RulesConfig;
import com.pheonix.creditappraisalmemo.domain.MlPredictionResult;
import com.pheonix.creditappraisalmemo.domain.MlPredictionRepository;
import com.pheonix.creditappraisalmemo.service.RulesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Admin-only endpoints for Rules Engine and ML prediction cache.
 * All writes are restricted to ADMIN role.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final RulesService rulesService;
    private final MlPredictionRepository mlPredictionRepository;

    public AdminController(RulesService rulesService,
                           MlPredictionRepository mlPredictionRepository) {
        this.rulesService = rulesService;
        this.mlPredictionRepository = mlPredictionRepository;
    }

    /** GET /api/admin/rules — Fetch current rules config */
    @AuditAction("Admin fetched rules engine configuration")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/rules")
    public ResponseEntity<RulesConfig> getRules() {
        return ResponseEntity.ok(rulesService.getConfig());
    }

    /** PUT /api/admin/rules — Update rules config (persists to DB) */
    @AuditAction("Admin updated rules engine configuration")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/rules")
    public ResponseEntity<RulesConfig> updateRules(@RequestBody RulesConfig updated) {
        return ResponseEntity.ok(rulesService.updateConfig(updated));
    }

    /** GET /api/admin/ml-predictions/{applicationId} — View cached ML result */
    @AuditAction("Admin viewed ML prediction cache for application")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPLIANCE_OFFICER', 'CREDIT_MANAGER', 'RISK_ANALYST')")
    @GetMapping("/ml-predictions/{applicationId}")
    public ResponseEntity<MlPredictionResult> getMlPrediction(@PathVariable Long applicationId) {
        Optional<MlPredictionResult> result = mlPredictionRepository.findByApplicationId(applicationId);
        return result.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
