"""
Fraud Detector: Isolation Forest to detect anomalous applications.
Isolation Forest is ideal for unsupervised fraud detection where
we don't have labeled fraud examples but know normal behavior.
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


def _generate_normal_data(n: int = 2000):
    """Generate 'normal' (non-fraudulent) application feature profiles."""
    rng = np.random.default_rng(42)

    rows = []
    for _ in range(n):
        suspicious_tx = rng.integers(0, 5)
        total_tx = rng.integers(50, 400)
        max_credit = rng.uniform(100_000, 2_000_000)
        avg_credit = rng.uniform(50_000, max_credit * 0.5)
        circular_flags = rng.integers(0, 2)
        gst_variance = rng.uniform(0, 10)
        rows.append([suspicious_tx, total_tx, max_credit, avg_credit, circular_flags, gst_variance])

    return np.array(rows)


class FraudDetector:
    def __init__(self):
        X_normal = _generate_normal_data()
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X_normal)
        self.model = IsolationForest(contamination=0.08, random_state=42)
        self.model.fit(X_scaled)

    def predict(self, suspicious_tx_count, total_tx_count, max_single_credit,
                avg_credit, circular_flag_count, avg_gst_variance_pct) -> dict:
        X = np.array([[
            suspicious_tx_count,
            total_tx_count,
            max_single_credit,
            avg_credit,
            circular_flag_count,
            avg_gst_variance_pct
        ]])
        X_scaled = self.scaler.transform(X)

        # score_samples returns negative values: more negative = more anomalous
        raw_score = float(self.model.score_samples(X_scaled)[0])
        pred = self.model.predict(X_scaled)[0]  # -1 = anomaly, 1 = normal

        # Convert to 0..1 fraud probability (raw_score is typically -0.8 to 0.2)
        normalized = max(0.0, min(1.0, (-raw_score - 0.1) * 1.5))
        is_anomalous = pred == -1

        return {
            "fraud_probability": round(normalized, 4),
            "fraud_probability_pct": f"{round(normalized * 100, 1)}%",
            "anomaly_score": round(raw_score, 4),
            "is_anomalous": is_anomalous,
        }


# Singleton
detector = FraudDetector()
