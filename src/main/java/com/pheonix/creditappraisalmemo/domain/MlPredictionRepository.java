package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MlPredictionRepository extends JpaRepository<MlPredictionResult, Long> {
    Optional<MlPredictionResult> findByApplicationId(Long applicationId);
}
