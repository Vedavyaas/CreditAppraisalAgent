"""
Risk Scorer: Logistic Regression model to predict credit risk score.
Trains on synthetic data calibrated to the domain.
Output is a probability transformed into a 0-100 score.
"""
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


def _generate_training_data(n: int = 2000):
    """Generate synthetic training samples. Balance stored in lakhs to avoid overflow."""
    rng = np.random.default_rng(42)
    data, labels = [], []

    for _ in range(n):
        circular_pct = rng.uniform(0, 40)
        circular_flags = int(circular_pct > 10) * int(rng.integers(1, 6))
        total_gst = int(rng.integers(4, 24))
        avg_balance_lakhs = float(rng.uniform(0.5, 100))   # lakhs — avoids matmul overflow
        cd_ratio = float(rng.uniform(0.5, 2.5))
        suspicious = int(rng.integers(0, 20))
        total_tx = int(rng.integers(20, 500))

        if circular_flags > 3 or suspicious / max(total_tx, 1) > 0.15 or avg_balance_lakhs < 1.0:
            label = 0
        elif circular_flags > 1 or circular_pct > 15 or cd_ratio < 0.8:
            label = 1
        else:
            label = 2

        data.append([circular_pct, circular_flags, total_gst,
                      avg_balance_lakhs, cd_ratio, suspicious, total_tx])
        labels.append(label)

    return np.array(data, dtype=np.float64), np.array(labels, dtype=np.int64)



class RiskScorer:
    DECISION_MAP = {0: "REJECTED", 1: "MANUAL_REVIEW", 2: "APPROVED"}
    BAND_MAP = {0: "HIGH", 1: "MEDIUM", 2: "LOW"}

    def __init__(self):
        X, y = _generate_training_data()
        self.model = Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=500, random_state=42, solver="lbfgs"))
        ])
        self.model.fit(X, y)

    def predict(self, gst_variance_pct, circular_trading_flags, total_gst_periods,
                avg_monthly_balance, credit_debit_ratio, suspicious_bank_tx_count,
                total_bank_tx_count) -> dict:
        X = np.array([[
            gst_variance_pct,
            circular_trading_flags,
            total_gst_periods,
            avg_monthly_balance / 100_000,   # convert rupees → lakhs to match training scale
            credit_debit_ratio,
            suspicious_bank_tx_count,
            total_bank_tx_count
        ]], dtype=np.float64)

        proba = self.model.predict_proba(X)[0]   # [P_rejected, P_manual, P_approved]
        pred_class = int(np.argmax(proba))
        confidence = float(proba[pred_class])

        # Risk score: high score = high risk. Weight toward rejected & manual review probability.
        risk_score = round((1.0 - float(proba[2])) * 100, 1)

        return {
            "risk_score": risk_score,
            "decision": self.DECISION_MAP[pred_class],
            "confidence": round(confidence, 4),
            "risk_band": self.BAND_MAP[pred_class],
        }


# Singleton instance — loaded once at startup
scorer = RiskScorer()
