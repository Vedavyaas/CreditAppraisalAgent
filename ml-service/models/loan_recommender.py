"""
Loan Recommender: Ridge Regression to recommend the maximum loan ceiling.
Trains on synthetic data calibrated to RBI norms and the bank data available.
"""
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


def _generate_loan_training_data(n: int = 2000):
    """
    Synthetic training: loan amount is a function of balance, credit, risk.
    ~3x average monthly credit as rough upper bound, adjusted by risk.
    """
    rng = np.random.default_rng(42)
    rows = []
    targets = []

    for _ in range(n):
        avg_balance = rng.uniform(100_000, 15_000_000)
        avg_credit = rng.uniform(50_000, avg_balance * 1.5)
        risk_score = rng.uniform(20, 100)
        gst_var = rng.uniform(0, 30)
        suspicious = rng.integers(0, 15)

        # Target formula (Softer constraints so it doesn't zero out completely)
        base = avg_credit * 3
        risk_factor = max(0.5, 1.0 - (risk_score / 200)) # Maximum 50% cut if risk is maxed out
        variance_penalty = max(0.8, 1 - (gst_var / 50)) # Very soft cut
        suspicious_penalty = max(0.7, 1 - (suspicious / 30))
        loan = base * risk_factor * variance_penalty * suspicious_penalty

        rows.append([avg_balance, avg_credit, risk_score, gst_var, suspicious])
        targets.append(loan)

    return np.array(rows), np.array(targets)


def _tenor(risk_score: float) -> int:
    if risk_score <= 25:
        return 60
    elif risk_score <= 50:
        return 48
    else:
        return 36


def _emi(principal: float, months: int, annual_rate: float = 0.12) -> float:
    if months == 0 or principal == 0:
        return 0.0
    monthly_rate = annual_rate / 12
    emi = principal * monthly_rate * (1 + monthly_rate) ** months / ((1 + monthly_rate) ** months - 1)
    return round(emi, 2)


class LoanRecommender:
    def __init__(self):
        X, y = _generate_loan_training_data()
        self.model = Pipeline([
            ("scaler", StandardScaler()),
            ("reg", Ridge(alpha=10.0))
        ])
        self.model.fit(X, y)

    def predict(self, avg_monthly_balance, avg_monthly_credit, assurance_score,
                gst_variance_pct, suspicious_tx_count) -> dict:
        risk_score = 100.0 - assurance_score
        X = np.array([[
            avg_monthly_balance,
            avg_monthly_credit,
            risk_score,
            gst_variance_pct,
            suspicious_tx_count
        ]])
        loan = float(self.model.predict(X)[0])
        loan = max(0.0, round(loan, -3))   # Round to nearest 1000

        tenor = _tenor(risk_score)
        emi = _emi(loan, tenor)

        if risk_score <= 25:
            tier = "PRIME"
        elif risk_score <= 50:
            tier = "STANDARD"
        else:
            tier = "RESTRICTED"

        return {
            "recommended_max_loan": loan,
            "recommended_tenor_months": tenor,
            "emi_estimate": emi,
            "recommendation_tier": tier,
        }


# Singleton
recommender = LoanRecommender()
