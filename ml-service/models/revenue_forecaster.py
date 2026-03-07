"""
Revenue Forecaster: Linear Regression on time-series GST monthly turnovers.
For each application, given n months of turnover data, predicts next 3 months.
Uses polynomial features of degree 2 to capture basic trends/curves.
"""
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import Pipeline


class RevenueForecaster:
    """
    Fits a per-request polynomial regression on the given monthly series,
    then extrapolates 3 steps ahead.
    """

    def predict(self, monthly_turnovers: list) -> dict:
        n = len(monthly_turnovers)

        if n < 2:
            # Not enough data — return flat forecast
            last = monthly_turnovers[-1] if monthly_turnovers else 0.0
            return {
                "next_3_months_forecast": [last, last, last],
                "trend": "STABLE",
                "growth_rate_pct": 0.0,
                "forecast_confidence": 0.3,
            }

        X = np.arange(n).reshape(-1, 1)
        y = np.array(monthly_turnovers)

        degree = 2 if n >= 4 else 1
        model = Pipeline([
            ("poly", PolynomialFeatures(degree=degree, include_bias=False)),
            ("reg", Ridge(alpha=1.0))
        ])
        model.fit(X, y)

        # Forecast next 3 months
        X_future = np.arange(n, n + 3).reshape(-1, 1)
        forecast = model.predict(X_future).tolist()
        forecast = [max(0.0, round(v, 2)) for v in forecast]

        # Trend: compare first half vs second half avg
        mid = max(1, n // 2)
        first_half_avg = float(np.mean(y[:mid]))
        second_half_avg = float(np.mean(y[mid:]))

        if first_half_avg == 0:
            growth_rate = 0.0
        else:
            growth_rate = round((second_half_avg - first_half_avg) / first_half_avg * 100, 2)

        if growth_rate > 5:
            trend = "GROWING"
        elif growth_rate < -5:
            trend = "DECLINING"
        else:
            trend = "STABLE"

        # Confidence: more data = more confident
        confidence = min(0.95, 0.4 + n * 0.025)

        return {
            "next_3_months_forecast": forecast,
            "trend": trend,
            "growth_rate_pct": growth_rate,
            "forecast_confidence": round(confidence, 3),
        }


# Singleton
forecaster = RevenueForecaster()
