package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PersonaSimulationRepository extends JpaRepository<PersonaSimulationResult, Long> {
    Optional<PersonaSimulationResult> findByApplicationId(Long applicationId);
}
