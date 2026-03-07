"""
Qualitative Score Adjuster — rule-based with keyword sentiment proxy.

The Credit Officer enters field observations after a site visit and management interview.
This model adjusts the ML risk score (from the Logistic Regression) up or down
by a maximum of ±20 points based on:
  - Capacity utilization % (on-site observation)
  - Promoter assessment (STRONG / NEUTRAL / CONCERNING)
  - Legal concerns presence
  - Length and richness of qualitative notes (proxy for diligence quality)
"""

# Sentiment keywords for site + interview notes
POSITIVE_KEYWORDS = [
    "excellent", "strong", "thriving", "growth", "modern", "efficient",
    "transparent", "cooperative", "confident", "profitable", "expanding",
    "operational", "clean", "no issues", "good", "positive", "healthy"
]
NEGATIVE_KEYWORDS = [
    "idle", "shutdown", "dispute", "litigation", "concern", "declining",
    "evasive", "hostile", "loss", "debt", "overdue", "poor", "bad",
    "struggling", "closure", "fraud", "allegation", "investigation"
]


def _sentiment_score(text: str) -> float:
    """Returns -1 to +1 sentiment of text based on keyword presence."""
    if not text:
        return 0.0
    lower = text.lower()
    positives = sum(1 for kw in POSITIVE_KEYWORDS if kw in lower)
    negatives = sum(1 for kw in NEGATIVE_KEYWORDS if kw in lower)
    total = positives + negatives
    if total == 0:
        return 0.0
    return (positives - negatives) / total


class QualitativeAdjuster:
    def predict(self,
                capacity_utilization_pct: int,
                promoter_assessment: str,
                has_legal_concerns: bool,
                site_notes_length: int,
                interview_notes_length: int,
                site_notes: str = "",
                interview_notes: str = "") -> dict:

        adjustment = 0.0
        reasons = []

        # 1. Capacity Utilization (±8 points)
        if capacity_utilization_pct >= 80:
            adjustment += 8
            reasons.append(f"Strong capacity utilization at {capacity_utilization_pct}% (+8)")
        elif capacity_utilization_pct >= 60:
            adjustment += 3
            reasons.append(f"Moderate capacity utilization at {capacity_utilization_pct}% (+3)")
        elif capacity_utilization_pct >= 40:
            adjustment -= 4
            reasons.append(f"Below-average capacity utilization at {capacity_utilization_pct}% (−4)")
        else:
            adjustment -= 8
            reasons.append(f"Critical low utilization at {capacity_utilization_pct}% (−8)")

        # 2. Promoter Assessment (±7 points)
        promoter_map = {"STRONG": 7, "NEUTRAL": 0, "CONCERNING": -7}
        p_score = promoter_map.get(promoter_assessment.upper(), 0)
        adjustment += p_score
        if p_score != 0:
            reasons.append(f"Promoter assessment: {promoter_assessment} ({'+' if p_score > 0 else ''}{p_score})")

        # 3. Legal Concerns (−10 points — hard penalty)
        if has_legal_concerns:
            adjustment -= 10
            reasons.append("Legal/regulatory concerns noted during due diligence (−10)")

        # 4. Note richness proxy — detailed notes = thorough diligence (+2 / −0)
        if site_notes_length > 100 and interview_notes_length > 100:
            adjustment += 2
            reasons.append("Comprehensive diligence notes submitted (+2)")

        # Clamp to ±20
        adjustment = max(-20.0, min(20.0, adjustment))

        # Overall sentiment from actual note text
        site_sentiment = _sentiment_score(site_notes)
        interview_sentiment = _sentiment_score(interview_notes)
        combined_sentiment = (site_sentiment + interview_sentiment) / 2

        if combined_sentiment > 0.2:
            sentiment = "POSITIVE"
        elif combined_sentiment < -0.2:
            sentiment = "NEGATIVE"
        else:
            sentiment = "NEUTRAL"

        return {
            "score_adjustment": round(adjustment, 1),
            "sentiment": sentiment,
            "adjustment_reason": " | ".join(reasons) if reasons else "No significant qualitative factors",
            "capacity_signal": "STRONG" if capacity_utilization_pct >= 70 else ("WEAK" if capacity_utilization_pct < 50 else "MODERATE"),
        }


adjuster = QualitativeAdjuster()
