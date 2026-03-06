package com.pheonix.creditappraisalmemo.ingestor.bank;

import com.pheonix.creditappraisalmemo.domain.BankTransaction;
import org.springframework.batch.infrastructure.item.ItemProcessor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Converts a BankRowDto → BankTransaction and detects suspicious same-day
 * round-sum circular transactions.
 *
 * Logic: If a credit and a debit of the exact same amount appear on the same
 * date, both are flagged as suspicious (classic shell-company circular flow).
 *
 * Note: because Batch processes items one at a time, we use an in-memory map
 * keyed by (date + amount) accumulated within this processor instance.
 */
public class BankItemProcessor implements ItemProcessor<BankRowDto, BankTransaction> {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final Long applicationId;
    // key = "date|amount", value = number of times seen as credit
    private final Map<String, Integer> creditTracker = new HashMap<>();

    public BankItemProcessor(Long applicationId) {
        this.applicationId = applicationId;
    }

    @Override
    public BankTransaction process(BankRowDto row) {
        BankTransaction tx = new BankTransaction();
        tx.setApplicationId(applicationId);

        LocalDate date = LocalDate.parse(row.getDate().trim(), DATE_FMT);
        tx.setTransactionDate(date);
        tx.setDescription(row.getDescription());

        BigDecimal credit = parseSafe(row.getCredit());
        BigDecimal debit  = parseSafe(row.getDebit());
        BigDecimal balance = parseSafe(row.getBalance());

        tx.setCredit(credit);
        tx.setDebit(debit);
        tx.setBalance(balance);

        // Suspicious: same amount credited and debited on the same day
        boolean suspicious = false;
        if (credit.compareTo(BigDecimal.ZERO) > 0) {
            String key = date + "|" + credit.toPlainString();
            creditTracker.merge(key, 1, Integer::sum);
        }
        if (debit.compareTo(BigDecimal.ZERO) > 0) {
            String key = date + "|" + debit.toPlainString();
            if (creditTracker.getOrDefault(key, 0) > 0) {
                suspicious = true;
            }
        }
        tx.setSuspiciousFlag(suspicious);
        return tx;
    }

    private BigDecimal parseSafe(String val) {
        try {
            return (val == null || val.isBlank()) ? BigDecimal.ZERO : new BigDecimal(val.trim());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }
}
