import random
import numpy as np
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

def _generate_behavioral_data(n: int = 1500):
    """
    Generates synthetic training data mapping the structural State Vector
    to multi-action probabilities.
    State Vector: [credit_score, income, current_debt, payment_history, spending_pattern, credit_utilization, macroeconomic_conditions]
    """
    rng = np.random.default_rng(42)
    X, y = [], []
    
    for _ in range(n):
        cibil = rng.uniform(300, 900)
        income = rng.uniform(10, 1000) # Lakhs
        debt = rng.uniform(0, 500)
        pay_hist = rng.uniform(0, 1.0) # 1.0 is perfect history
        spend_pattern = rng.uniform(0, 1.0) # 1.0 is highly aggressive/expansionary
        macro = rng.uniform(0, 1.0) # 1.0 is booming economy
        
        utilization = min(debt / max(income, 1.0), 1.0)
        
        # Determine base unscaled probabilities based on structural logic
        p_pay_on_time = 0.5 + 0.3 * pay_hist + 0.1 * macro - 0.2 * utilization + (cibil - 600) * 0.0005
        p_default = 0.4 - 0.3 * pay_hist - 0.1 * macro + 0.3 * utilization - (cibil - 600) * 0.0005
        p_miss = p_default * 0.7  # Missed payments correlated with default risk
        p_close_account = rng.uniform(0, 0.2) + 0.1 * (1 - macro)  # Usually unrelated, slightly higher in bad macro
        p_increase_spend = spend_pattern * 0.5 + macro * 0.4
        
        # Softmax normalize bounds to probabilistic output space (not strictly sum-to-1 because actions can overlap, 
        # e.g., mix of missing a payment and increasing spending, but they are individual probabilities [0,1])
        probs = np.clip([p_pay_on_time, p_miss, p_close_account, p_increase_spend, p_default], 0.01, 0.99)
        
        X.append([cibil, income, debt, pay_hist, spend_pattern, utilization, macro])
        y.append(probs)
        
    return np.array(X, dtype=np.float64), np.array(y, dtype=np.float64)

class PersonaBrain:
    """
    Simulates a 'Digital Twin' or 'Cognitive Brain' of the borrower's management.
    Includes an initial Cognitive Profile assessment and an advanced 
    Neural Network Automata simulating the borrower's State Vector into action probabilities.
    """
    def __init__(self):
        # Initialize and Train the Neural Network Automata on synthetic behavioral logic
        X, y = _generate_behavioral_data()
        self.automata = Pipeline([
            ("scaler", StandardScaler()),
            ("nn", MLPRegressor(hidden_layer_sizes=(16, 8), max_iter=500, random_state=42, activation="relu"))
        ])
        self.automata.fit(X, y)

    def _predict_actions(self, state_vector):
        """Predict actions: [pay_on_time, miss_payment, close_account, increase_spending, default]"""
        X_infer = np.array([state_vector], dtype=np.float64)
        pred_probs = self.automata.predict(X_infer)[0]
        # Ensure strict probability bounds via clipping
        return np.clip(pred_probs, 0.01, 0.99)

    def simulate(self, company_name: str, sector: str, turnover: float, 
                 capacity_utilization: int, promoter_assessment: str, 
                 legal_concerns: bool, credit_score: float, income: float, current_debt: float, 
                 payment_history: float, spending_pattern: float, credit_utilization: float, 
                 macroeconomic_conditions: float):
        
        print(f"[PersonaBrain] Instantiating cognitive simulation & neural automata for {company_name}")
        
        # ── 1. Neural Network Automata execution ──
        # Scale Rupee inputs down to Lakhs (100,000) to match Neural Net training bounds
        state_vector = [
            credit_score, 
            income / 100_000.0 if income > 10000 else income, 
            current_debt / 100_000.0 if current_debt > 10000 else current_debt, 
            payment_history, 
            spending_pattern, 
            credit_utilization, 
            macroeconomic_conditions
        ]
        action_probs = self._predict_actions(state_vector)

        # ── 2. Structural & Mock Cognitive Profiling ──
        pressures = []
        if sector == "Manufacturing":
            pressures.append("Raw material supply chain disruptions causing 15% cost increase.")
        elif sector == "IT Services":
            pressures.append("High attrition rates and tightening global IT budgets.")
        else:
            pressures.append("Unpredictable macro-economic shifts impacting working capital cycles.")
            
        if capacity_utilization < 60:
            pressures.append("Idle capacity is creating a severe drag on fixed cost recovery.")
        if promoter_assessment.upper() == "CONCERNING":
            pressures.append("Management team is reportedly evasive and reactive to market changes.")
        if legal_concerns:
            pressures.append("Active litigation is diverting critical leadership bandwidth.")
            
        resilience_base = 50.0
        if promoter_assessment.upper() == "STRONG": resilience_base += 20
        elif promoter_assessment.upper() == "NEUTRAL": resilience_base += 5
        else: resilience_base -= 20
        if not legal_concerns: resilience_base += 10
        if capacity_utilization > 75: resilience_base += 15

        scenarios = [
            {"id": "S1", "question": "Your primary buyer delays payment by 60 days. How do you cover payroll and your upcoming EMI?"},
            {"id": "S2", "question": "A new competitor enters the market undercutting your prices by 10%. What is your strategic response?"}
        ]
        
        responses = []
        if resilience_base > 70:
            responses.append({"scenario_id": "S1", "response": "We will draw down on our pre-approved capital buffer. We penalize the buyer on future consignments."})
            responses.append({"scenario_id": "S2", "response": "We fast-track our premium product line to differentiate, relying on superior quality rather than a price war."})
            behavior_adj, sentiment = 10, "HIGH_RESILIENCE"
        elif resilience_base > 40:
            responses.append({"scenario_id": "S1", "response": "We negotiate a short-term overdraft. Payroll might be delayed slightly for management, but EMI is paid."})
            responses.append({"scenario_id": "S2", "response": "We match pricing temporarily on bulk orders to retain share, which may compress our margins by 4-5%."})
            behavior_adj, sentiment = 0, "MODERATE_RESILIENCE"
        else:
            responses.append({"scenario_id": "S1", "response": "We have no immediate buffer. We halt production to conserve cash and request an EMI moratorium."})
            responses.append({"scenario_id": "S2", "response": "We cannot compete on price. We may lose market share and need to lay off workers to survive."})
            behavior_adj, sentiment = -15, "LOW_RESILIENCE"
            
        return {
            "cognitive_profile": "Aggressive Growth but Cash-Strapped" if capacity_utilization > 80 and resilience_base < 60 else ("Conservative & Stable" if resilience_base > 60 else "Vulnerable & Reactive"),
            "simulated_pressures": pressures,
            "scenarios_tested": scenarios,
            "simulated_responses": responses,
            "behavioral_resilience_score": max(0.0, min(100.0, resilience_base + random.uniform(-5, 5))),
            "assurance_adjustment": behavior_adj,
            "sentiment": sentiment,
            
            # Action Output
            "p_pay_on_time": float(action_probs[0]),
            "p_miss_payment": float(action_probs[1]),
            "p_close_account": float(action_probs[2]),
            "p_increase_spending": float(action_probs[3]),
            "p_default": float(action_probs[4])
        }

# Singleton instance — trained at start
brain_simulator = PersonaBrain()
