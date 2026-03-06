package com.pheonix.creditappraisalmemo.ingestor.gst;

import com.opencsv.bean.CsvBindByName;

public class GstRowDto {

    @CsvBindByName(column = "period")
    private String period;

    @CsvBindByName(column = "gstr3bTurnover")
    private String gstr3bTurnover;

    @CsvBindByName(column = "gstr2aTurnover")
    private String gstr2aTurnover;

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public String getGstr3bTurnover() { return gstr3bTurnover; }
    public void setGstr3bTurnover(String gstr3bTurnover) { this.gstr3bTurnover = gstr3bTurnover; }

    public String getGstr2aTurnover() { return gstr2aTurnover; }
    public void setGstr2aTurnover(String gstr2aTurnover) { this.gstr2aTurnover = gstr2aTurnover; }
}
