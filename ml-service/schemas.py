"""
Pydantic schemas for all ML service request/response pairs.
Spring Boot will POST data from the DB and receive structured predictions.
"""
from pydantic import BaseModel
from typing import Optional, List


# ── Risk Scorer ──────────────────────────────────────────────────────────────
class RiskScorerRequest(BaseModel):
    application_id: int
    gst_variance_pct: float        # Avg variance % across all periods
    circular_trading_flags: int    # Number of flagged GST periods
    total_gst_periods: int         # Total GST periods uploaded
    avg_monthly_balance: float     # Avg closing bank balance
    credit_debit_ratio: float      # Total credits / total debits
    suspicious_bank_tx_count: int  # Number of flagged bank transactions
    total_bank_tx_count: int       # Total transactions


class RiskScorerResponse(BaseModel):
    application_id: int
    risk_score: float              # 0.0 to 100.0 (higher = safer)
    decision: str                  # 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED'
    confidence: float              # 0.0 to 1.0
    risk_band: str                 # 'LOW' | 'MEDIUM' | 'HIGH'


# ── Fraud Detector ───────────────────────────────────────────────────────────
class FraudDetectorRequest(BaseModel):
    application_id: int
    suspicious_tx_count: int
    total_tx_count: int
    max_single_credit: float
    avg_credit: float
    circular_flag_count: int
    avg_gst_variance_pct: float


class FraudDetectorResponse(BaseModel):
    application_id: int
    fraud_probability: float       # 0.0 to 1.0
    fraud_probability_pct: str     # e.g. "12.3%"
    anomaly_score: float           # Raw Isolation Forest score
    is_anomalous: bool


# ── Revenue Forecaster ───────────────────────────────────────────────────────
class ForecastRequest(BaseModel):
    application_id: int
    monthly_turnovers: List[float]  # Chronological list of monthly GST 3B values


class ForecastResponse(BaseModel):
    application_id: int
    next_3_months_forecast: List[float]
    trend: str                     # 'GROWING' | 'STABLE' | 'DECLINING'
    growth_rate_pct: float
    forecast_confidence: float


# ── Loan Recommender ─────────────────────────────────────────────────────────
class LoanRecommenderRequest(BaseModel):
    application_id: int
    avg_monthly_balance: float
    avg_monthly_credit: float
    risk_score: float
    gst_variance_pct: float
    suspicious_tx_count: int


class LoanRecommenderResponse(BaseModel):
    application_id: int
    recommended_max_loan: float    # INR amount
    recommended_tenor_months: int
    emi_estimate: float
    recommendation_tier: str       # 'PRIME' | 'STANDARD' | 'RESTRICTED'


# ── Qualitative Score Adjustment ─────────────────────────────────────────────
class QualitativeRequest(BaseModel):
    application_id: int
    capacity_utilization_pct: int       # 0–100, from site visit
    promoter_assessment: str            # STRONG | NEUTRAL | CONCERNING
    has_legal_concerns: bool
    site_notes_length: int              # proxy for thoroughness
    interview_notes_length: int


class QualitativeResponse(BaseModel):
    application_id: int
    score_adjustment: float             # −20 to +20 points
    sentiment: str                      # POSITIVE | NEUTRAL | NEGATIVE
    adjustment_reason: str              # Explainability text
    capacity_signal: str                # STRONG | MODERATE | WEAK

