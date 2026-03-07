package com.pheonix.creditappraisalmemo.controller;

import com.pheonix.creditappraisalmemo.aspect.AuditAction;
import com.pheonix.creditappraisalmemo.domain.RulesConfig;
import com.pheonix.creditappraisalmemo.domain.MlPredictionResult;
import com.pheonix.creditappraisalmemo.domain.MlPredictionRepository;
import com.pheonix.creditappraisalmemo.service.RulesService;
import com.pheonix.creditappraisalmemo.service.AutomatedReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.pheonix.creditappraisalmemo.repository.UserDetailsRepository;
import com.pheonix.creditappraisalmemo.repository.AuditLogRepository;
import com.pheonix.creditappraisalmemo.domain.CreditApplicationRepository;

/**
 * Admin-only endpoints for Rules Engine and ML prediction cache.
 * All writes are restricted to ADMIN role.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final RulesService rulesService;
    private final MlPredictionRepository mlPredictionRepository;
    private final AutomatedReportService reportService;
    private final UserDetailsRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final CreditApplicationRepository applicationRepository;

    public AdminController(RulesService rulesService,
                           MlPredictionRepository mlPredictionRepository,
                           AutomatedReportService reportService,
                           UserDetailsRepository userRepository,
                           AuditLogRepository auditLogRepository,
                           CreditApplicationRepository applicationRepository) {
        this.rulesService = rulesService;
        this.mlPredictionRepository = mlPredictionRepository;
        this.reportService = reportService;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.applicationRepository = applicationRepository;
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
        RulesConfig saved = rulesService.updateConfig(updated);
        
        // 🚀 RE-SCORE ALL: Trigger background re-synthesis for all apps affected by rule changes
        new Thread(() -> {
            try {
                mlPredictionRepository.findAll().forEach(pred -> {
                    reportService.generateReport(pred.getApplicationId());
                });
            } catch (Exception e) {
                // Silently log
            }
        }).start();

        return ResponseEntity.ok(saved);
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

    /** GET /api/admin/workforce-analytics — Get productivity stats for all employees */
    @AuditAction("Admin viewed workforce productivity analytics")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/workforce-analytics")
    public ResponseEntity<List<EmployeeStats>> getWorkforceAnalytics() {
        var logs = auditLogRepository.findAll();
        var apps = applicationRepository.findAll();
        var users = userRepository.findAll();

        Map<String, Long> activityMap = logs.stream()
                .filter(l -> l.getUsername() != null)
                .collect(Collectors.groupingBy(l -> l.getUsername(), Collectors.counting()));

        Map<String, Long> appsMap = apps.stream()
                .filter(a -> a.getCreatedBy() != null)
                .collect(Collectors.groupingBy(a -> a.getCreatedBy(), Collectors.counting()));

        List<EmployeeStats> stats = userRepository.findAll().stream().map(u -> {
            long actions = activityMap.getOrDefault(u.getEmail(), 0L);
            long creations = appsMap.getOrDefault(u.getEmail(), 0L);
            return new EmployeeStats(u.getName(), u.getEmail(), u.getRole().name(), actions, creations);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(stats);
    }

    public record EmployeeStats(String name, String email, String role, long totalActions, long applicationsCreated) {}
}
