package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DueDiligenceNoteRepository extends JpaRepository<DueDiligenceNote, Long> {
    List<DueDiligenceNote> findByApplicationId(Long applicationId);
    List<DueDiligenceNote> findByApplicationIdAndCategory(Long applicationId, DueDiligenceNote.NoteCategory category);
}
