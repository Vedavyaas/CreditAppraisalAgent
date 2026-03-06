package com.pheonix.creditappraisalmemo.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findByApplicationId(Long applicationId);
    List<BankTransaction> findByApplicationIdAndSuspiciousFlagTrue(Long applicationId);
    List<BankTransaction> findByApplicationIdAndTransactionDateBetween(Long applicationId, LocalDate from, LocalDate to);
}
