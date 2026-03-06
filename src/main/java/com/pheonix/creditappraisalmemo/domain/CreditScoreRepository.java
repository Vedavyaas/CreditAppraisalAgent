package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CreditScoreRepository extends JpaRepository<CreditScore, Long> {
    Optional<CreditScore> findByApplicationId(Long applicationId);
}
