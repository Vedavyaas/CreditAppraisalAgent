package com.pheonix.creditappraisalmemo.service;

import com.pheonix.creditappraisalmemo.domain.RulesConfig;
import com.pheonix.creditappraisalmemo.domain.RulesConfigRepository;
import org.springframework.stereotype.Service;

/**
 * Manages the singleton rules engine config.
 * On first call, creates the default config row if it doesn't exist.
 */
@Service
public class RulesService {

    private final RulesConfigRepository repo;

    public RulesService(RulesConfigRepository repo) {
        this.repo = repo;
    }

    public RulesConfig getConfig() {
        return repo.findById(1L).orElseGet(() -> repo.save(new RulesConfig()));
    }

    public RulesConfig updateConfig(RulesConfig updated) {
        RulesConfig existing = getConfig();
        existing.setGstVarianceThreshold(updated.getGstVarianceThreshold());
        existing.setMaxAutoApprovalLoanAmount(updated.getMaxAutoApprovalLoanAmount());
        existing.setCibilCheckRequired(updated.isCibilCheckRequired());
        existing.setForceOtpLogin(updated.isForceOtpLogin());
        existing.setMlServiceUrl(updated.getMlServiceUrl());
        return repo.save(existing);
    }

    /** Convenience: return GST threshold as BigDecimal-friendly double */
    public double getGstVarianceThreshold() {
        return getConfig().getGstVarianceThreshold();
    }
}
