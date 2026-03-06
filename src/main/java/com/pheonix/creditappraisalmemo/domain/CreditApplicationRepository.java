package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CreditApplicationRepository extends JpaRepository<CreditApplication, Long> {
    List<CreditApplication> findByCreatedBy(String createdBy);
    List<CreditApplication> findByStatus(CreditApplication.ApplicationStatus status);
    Optional<CreditApplication> findByCin(String cin);
}
