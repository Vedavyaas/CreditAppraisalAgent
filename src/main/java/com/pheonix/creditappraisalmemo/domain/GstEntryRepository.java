package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GstEntryRepository extends JpaRepository<GstEntry, Long> {
    List<GstEntry> findByApplicationId(Long applicationId);
    List<GstEntry> findByApplicationIdAndCircularTradingFlagTrue(Long applicationId);
}
