package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QualitativeNoteRepository extends JpaRepository<QualitativeNote, Long> {
    Optional<QualitativeNote> findByApplicationId(Long applicationId);
}
