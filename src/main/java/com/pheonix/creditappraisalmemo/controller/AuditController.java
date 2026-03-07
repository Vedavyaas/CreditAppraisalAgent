package com.pheonix.creditappraisalmemo.controller;

import com.pheonix.creditappraisalmemo.aspect.AuditAction;
import com.pheonix.creditappraisalmemo.repository.AuditLogEntity;
import com.pheonix.creditappraisalmemo.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @AuditAction("Accessed system-wide audit trails")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPLIANCE_OFFICER')")
    @GetMapping
    public ResponseEntity<List<AuditLogEntity>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }
}
