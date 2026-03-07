package com.pheonix.creditappraisalmemo.ingestor.gst;

import com.pheonix.creditappraisalmemo.domain.GstEntry;
import org.springframework.batch.infrastructure.item.ItemProcessor;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class GstItemProcessor implements ItemProcessor<GstRowDto, GstEntry> {

    /** Injected from RulesService at job-launch time — Admin can change it in the DB. */
    private final BigDecimal circularTradeThreshold;

    private final Long applicationId;

    public GstItemProcessor(Long applicationId, double thresholdFromDb) {
        this.applicationId = applicationId;
        this.circularTradeThreshold = BigDecimal.valueOf(thresholdFromDb);
    }

    @Override
    public GstEntry process(GstRowDto row) {
        GstEntry entry = new GstEntry();
        entry.setApplicationId(applicationId);
        entry.setPeriod(row.getPeriod());

        BigDecimal gstr3b = parseSafe(row.getGstr3bTurnover());
        BigDecimal gstr2a = parseSafe(row.getGstr2aTurnover());

        entry.setGstr3bTurnover(gstr3b);
        entry.setGstr2aTurnover(gstr2a);

        BigDecimal diff = gstr3b.subtract(gstr2a).abs();
        entry.setDifference(diff);

        // Flag circular trading if discrepancy exceeds the admin-configured threshold
        boolean flagged = false;
        if (gstr3b.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discrepancyRatio = diff.divide(gstr3b, 4, RoundingMode.HALF_UP);
            flagged = discrepancyRatio.compareTo(circularTradeThreshold) > 0;
        }
        entry.setCircularTradingFlag(flagged);

        return entry;
    }

    private BigDecimal parseSafe(String val) {
        try {
            return (val == null || val.isBlank()) ? BigDecimal.ZERO : new BigDecimal(val.trim());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }
}
