"""
Credit Appraisal ML Service — FastAPI entry point.
Runs on port 8000. Spring Boot calls these endpoints with features
extracted from the DB and receives structured ML predictions.

Start with:  uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

from schemas import (
    RiskScorerRequest, RiskScorerResponse,
    FraudDetectorRequest, FraudDetectorResponse,
    ForecastRequest, ForecastResponse,
    LoanRecommenderRequest, LoanRecommenderResponse,
    QualitativeRequest, QualitativeResponse,
    ResearchCrawlerRequest, ResearchCrawlerResponse,
)
from models.risk_scorer import scorer
from models.fraud_detector import detector
from models.revenue_forecaster import forecaster
from models.loan_recommender import recommender
from models.qualitative_adjuster import adjuster
from models.research_crawler import crawler
from models.persona_brain import brain_simulator

app = FastAPI(
    title="Credit Appraisal ML Service",
    description="Scikit-learn based ML models for credit risk, fraud, forecasting, and loan recommendation.",
    version="1.0.0"
)

# Allow Spring Boot to call from localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8090", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("ml-service")


@app.get("/health")
def health():
    """Spring Boot pings this to verify the ML service is up."""
    return {"status": "UP", "models": ["risk_scorer", "fraud_detector", "revenue_forecaster", "loan_recommender", "qualitative_adjuster", "research_crawler", "persona_brain"]}


# ── Risk Score ────────────────────────────────────────────────────────────────
@app.post("/predict/risk", response_model=RiskScorerResponse)
def predict_risk(req: RiskScorerRequest):
    """
    Logistic Regression — credit risk score + APPROVED/MANUAL_REVIEW/REJECTED decision.
    Spring posts DB-aggregated GST and Bank features.
    """
    try:
        result = scorer.predict(
            gst_variance_pct=req.gst_variance_pct,
            circular_trading_flags=req.circular_trading_flags,
            total_gst_periods=req.total_gst_periods,
            avg_monthly_balance=req.avg_monthly_balance,
            credit_debit_ratio=req.credit_debit_ratio,
            suspicious_bank_tx_count=req.suspicious_bank_tx_count,
            total_bank_tx_count=req.total_bank_tx_count,
        )
        return RiskScorerResponse(application_id=req.application_id, **result)
    except Exception as e:
        logger.error(f"Risk scorer error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Fraud Detection ───────────────────────────────────────────────────────────
@app.post("/predict/fraud", response_model=FraudDetectorResponse)
def predict_fraud(req: FraudDetectorRequest):
    """
    Isolation Forest — unsupervised anomaly detection / fraud probability.
    """
    try:
        result = detector.predict(
            suspicious_tx_count=req.suspicious_tx_count,
            total_tx_count=req.total_tx_count,
            max_single_credit=req.max_single_credit,
            avg_credit=req.avg_credit,
            circular_flag_count=req.circular_flag_count,
            avg_gst_variance_pct=req.avg_gst_variance_pct,
        )
        return FraudDetectorResponse(application_id=req.application_id, **result)
    except Exception as e:
        logger.error(f"Fraud detector error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Revenue Forecast ──────────────────────────────────────────────────────────
@app.post("/predict/forecast", response_model=ForecastResponse)
def predict_forecast(req: ForecastRequest):
    """
    Polynomial Ridge Regression — forecasts 3 months of GST turnover from historical series.
    """
    try:
        result = forecaster.predict(monthly_turnovers=req.monthly_turnovers)
        return ForecastResponse(application_id=req.application_id, **result)
    except Exception as e:
        logger.error(f"Forecaster error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Loan Recommendation ───────────────────────────────────────────────────────
@app.post("/predict/loan", response_model=LoanRecommenderResponse)
def predict_loan(req: LoanRecommenderRequest):
    """
    Ridge Regression — recommends max loan amount + tenor + EMI estimate.
    """
    try:
        result = recommender.predict(
            avg_monthly_balance=req.avg_monthly_balance,
            avg_monthly_credit=req.avg_monthly_credit,
            assurance_score=req.assurance_score,
            gst_variance_pct=req.gst_variance_pct,
            suspicious_tx_count=req.suspicious_tx_count,
        )
        return LoanRecommenderResponse(application_id=req.application_id, **result)
    except Exception as e:
        logger.error(f"Loan recommender error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Qualitative Score Adjustment ──────────────────────────────────────────────
@app.post("/predict/qualitative", response_model=QualitativeResponse)
def predict_qualitative(req: QualitativeRequest):
    """
    Rule-based + keyword sentiment model.
    Takes Credit Officer's field observations and returns a score adjustment (±20).
    This is the 'Primary Insight Integration' pillar of the hackathon deliverables.
    """
    try:
        result = adjuster.predict(
            capacity_utilization_pct=req.capacity_utilization_pct,
            promoter_assessment=req.promoter_assessment,
            has_legal_concerns=req.has_legal_concerns,
            site_notes_length=req.site_notes_length,
            interview_notes_length=req.interview_notes_length,
        )
        return QualitativeResponse(application_id=req.application_id, **result)
    except Exception as e:
        logger.error(f"Qualitative adjuster error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Web Research Crawler ────────────────────────────────────────────────────
# ── Web Research Crawler ────────────────────────────────────────────────────
@app.post("/crawl/research", response_model=ResearchCrawlerResponse)
def crawl_research(req: ResearchCrawlerRequest):
    """
    Triggers the Python Research Agent to scrape and synthesize 
    real-time corporate data from public sources (MCA/Zaubacorp/News).
    """
    try:
        result = crawler.crawl(
            company_name=req.company_name,
            cin=req.cin
        )
        return ResearchCrawlerResponse(application_id=req.application_id, **result)
    except Exception as e:
        logger.error(f"Crawler error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Persona / Cognitive Brain Simulation ────────────────────────────────────
from schemas import PersonaSimulationRequest, PersonaSimulationResponse

@app.post("/predict/persona-simulation", response_model=PersonaSimulationResponse)
def simulate_persona(req: PersonaSimulationRequest):
    """
    Simulates a 'Digital Twin' of the borrower to stress-test their operational resilience.
    Uses contextual data to build a psychological profile and evaluates their likely responses.
    """
    try:
        result = brain_simulator.simulate(
            company_name=req.company_name,
            sector=req.sector,
            turnover=req.turnover,
            capacity_utilization=req.capacity_utilization_pct,
            promoter_assessment=req.promoter_assessment,
            legal_concerns=req.has_legal_concerns,
            credit_score=req.credit_score,
            income=req.income,
            current_debt=req.current_debt,
            payment_history=req.payment_history,
            spending_pattern=req.spending_pattern,
            credit_utilization=req.credit_utilization,
            macroeconomic_conditions=req.macroeconomic_conditions
        )
        return PersonaSimulationResponse(application_id=req.application_id, **result)
    except Exception as e:
        logger.error(f"Persona Simulator error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


