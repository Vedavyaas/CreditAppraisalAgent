package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WebResearchRepository extends JpaRepository<WebResearchResult, Long> {
    Optional<WebResearchResult> findByApplicationId(Long applicationId);
}
