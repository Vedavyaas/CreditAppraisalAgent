package com.pheonix.creditappraisalmemo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "persona_simulation_result")
public class PersonaSimulationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long applicationId;

    private String cognitiveProfile;
    
    @Column(columnDefinition = "TEXT")
    private String simulatedPressuresJson;
    
    @Column(columnDefinition = "TEXT")
    private String scenariosTestedJson;

    @Column(columnDefinition = "TEXT")
    private String simulatedResponsesJson;

    private Double behavioralResilienceScore;
    private Double assuranceAdjustment;
    private String sentiment;
    private LocalDateTime simulatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getCognitiveProfile() { return cognitiveProfile; }
    public void setCognitiveProfile(String cognitiveProfile) { this.cognitiveProfile = cognitiveProfile; }

    public String getSimulatedPressuresJson() { return simulatedPressuresJson; }
    public void setSimulatedPressuresJson(String simulatedPressuresJson) { this.simulatedPressuresJson = simulatedPressuresJson; }

    public String getScenariosTestedJson() { return scenariosTestedJson; }
    public void setScenariosTestedJson(String scenariosTestedJson) { this.scenariosTestedJson = scenariosTestedJson; }

    public String getSimulatedResponsesJson() { return simulatedResponsesJson; }
    public void setSimulatedResponsesJson(String simulatedResponsesJson) { this.simulatedResponsesJson = simulatedResponsesJson; }

    public Double getBehavioralResilienceScore() { return behavioralResilienceScore; }
    public void setBehavioralResilienceScore(Double behavioralResilienceScore) { this.behavioralResilienceScore = behavioralResilienceScore; }

    public Double getAssuranceAdjustment() { return assuranceAdjustment; }
    public void setAssuranceAdjustment(Double assuranceAdjustment) { this.assuranceAdjustment = assuranceAdjustment; }

    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }

    public LocalDateTime getSimulatedAt() { return simulatedAt; }
    public void setSimulatedAt(LocalDateTime simulatedAt) { this.simulatedAt = simulatedAt; }
}
