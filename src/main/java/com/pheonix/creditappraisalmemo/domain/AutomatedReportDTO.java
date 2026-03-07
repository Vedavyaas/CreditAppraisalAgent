package com.pheonix.creditappraisalmemo.domain;

import java.util.List;

public class AutomatedReportDTO {
    private String id;
    private String name;
    private Double requestedAmount;
    private Integer aiRiskScore;
    private String autoDecision;
    private String fraudProbability;
    private String dtiRatio;
    private List<String> keyDrivers;

    public AutomatedReportDTO() {
    }

    public AutomatedReportDTO(String id, String name, Double requestedAmount, Integer aiRiskScore, String autoDecision, String fraudProbability, String dtiRatio, List<String> keyDrivers) {
        this.id = id;
        this.name = name;
        this.requestedAmount = requestedAmount;
        this.aiRiskScore = aiRiskScore;
        this.autoDecision = autoDecision;
        this.fraudProbability = fraudProbability;
        this.dtiRatio = dtiRatio;
        this.keyDrivers = keyDrivers;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(Double requestedAmount) {
        this.requestedAmount = requestedAmount;
    }

    public Integer getAiRiskScore() {
        return aiRiskScore;
    }

    public void setAiRiskScore(Integer aiRiskScore) {
        this.aiRiskScore = aiRiskScore;
    }

    public String getAutoDecision() {
        return autoDecision;
    }

    public void setAutoDecision(String autoDecision) {
        this.autoDecision = autoDecision;
    }

    public String getFraudProbability() {
        return fraudProbability;
    }

    public void setFraudProbability(String fraudProbability) {
        this.fraudProbability = fraudProbability;
    }

    public String getDtiRatio() {
        return dtiRatio;
    }

    public void setDtiRatio(String dtiRatio) {
        this.dtiRatio = dtiRatio;
    }

    public List<String> getKeyDrivers() {
        return keyDrivers;
    }

    public void setKeyDrivers(List<String> keyDrivers) {
        this.keyDrivers = keyDrivers;
    }
}
