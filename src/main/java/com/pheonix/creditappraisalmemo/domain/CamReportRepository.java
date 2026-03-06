package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CamReportRepository extends JpaRepository<CamReport, Long> {
    Optional<CamReport> findByApplicationId(Long applicationId);
}
