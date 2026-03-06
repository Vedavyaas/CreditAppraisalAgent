package com.pheonix.creditappraisalmemo.ingestor.bank;

import com.opencsv.bean.CsvBindByName;

public class BankRowDto {

    @CsvBindByName(column = "date")
    private String date;           // yyyy-MM-dd

    @CsvBindByName(column = "description")
    private String description;

    @CsvBindByName(column = "credit")
    private String credit;

    @CsvBindByName(column = "debit")
    private String debit;

    @CsvBindByName(column = "balance")
    private String balance;

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCredit() { return credit; }
    public void setCredit(String credit) { this.credit = credit; }

    public String getDebit() { return debit; }
    public void setDebit(String debit) { this.debit = debit; }

    public String getBalance() { return balance; }
    public void setBalance(String balance) { this.balance = balance; }
}
