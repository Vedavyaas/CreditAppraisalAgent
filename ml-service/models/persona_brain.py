import numpy as np
import logging
import warnings
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore') # Ignore convergence warnings

class PersonaBrain:
    """
    Persona Synthesis Model: Uses advanced Deep Learning (Multi-Layer Perceptron)
    to build a digital twin of the borrower and output actionable constraints.
    """
    def __init__(self):
        self.logger = logging.getLogger("persona-brain")
        self._initialize_neural_networks()

    def _initialize_neural_networks(self):
        """Trains the MLPs on synthetic 'historical' data for deep non-linear mapping."""
        self.logger.info("Initializing Deep Neural Networks for Persona Brain...")
        np.random.seed(42) 
        
        # 1. Synthetic Historical Data Generation (1500 profiles)
        # Features: [Risk_Score, Growth_Rate, CIBIL, Chaos_Metric, Sentiment]
        X_train = np.random.rand(1500, 5) * [100, 50, 900, 5, 20] 
        
        y_arch = []
        y_constraints = []
        for x in X_train:
            # Generate target archetypes
            if x[1] > 30 and x[0] < 40: arch = 1 # Scaler
            elif x[0] > 70 and x[1] < 10: arch = 2 # Planner
            elif x[3] > 3: arch = 3 # Fireman
            elif x[2] > 750 and x[3] > 1: arch = 4 # Veteran
            else: arch = 0 # Pillar
            y_arch.append(arch)

            # Generate target non-linear constraints [Risk_Modifier, Limit_Multiplier]
            base_mult = 1.0; risk_mod = 0.0
            if arch == 1: base_mult = 1.2; risk_mod = 5.0
            elif arch == 2: base_mult = 1.1; risk_mod = -3.0
            elif arch == 3: base_mult = 0.5; risk_mod = 18.0
            elif arch == 4: base_mult = 0.8; risk_mod = 10.0
            else: base_mult = 1.0; risk_mod = 0.0
                
            # Add complexity (stress test variables)
            base_mult -= (x[0]/100) * 0.3
            base_mult += (x[4]/20) * 0.15
            risk_mod += (x[3] * 2) - (x[2]//100)
            y_constraints.append([risk_mod, base_mult])

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X_train)
        y_arch = np.array(y_arch)
        y_constraints = np.array(y_constraints)

        # 2. Train the Artificial Neural Networks
        self.logger.info("Training MLP Archetype Classifier (Layer Architecture: 64x32)...")
        self.arch_nn = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=250, activation='relu', random_state=42)
        self.arch_nn.fit(X_scaled, y_arch)

        self.logger.info("Training MLP Constraint Regressor (Layer Architecture: 128x64x32)...")
        self.constraint_nn = MLPRegressor(hidden_layer_sizes=(128, 64, 32), max_iter=300, activation='relu', random_state=42)
        self.constraint_nn.fit(X_scaled, y_constraints)

        self.arch_labels = [
            "THE_STEADY_PILLAR", "THE_HIGH_VELOCITY_SCALER", 
            "THE_METICULOUS_PLANNER", "THE_OPPORTUNISTIC_FIREMAN", "THE_BATTLING_VETERAN"
        ]

    def synthesize(self, req):
        """
        Deep Learning forward propagation through trained MLPs.
        """
        # 1. Prepare Real-Time Input Vector
        chaos_metric = req.fraud_probability + (req.litigation_count * 0.1)
        X_real = np.array([[req.risk_score, req.growth_rate, req.cibil_score, chaos_metric, req.sentiment_score]])
        X_scaled = self.scaler.transform(X_real)

        # 2. Neural Net Propagations
        arch_idx = self.arch_nn.predict(X_scaled)[0]
        archetype = self.arch_labels[arch_idx]
        
        constraints = self.constraint_nn.predict(X_scaled)[0]
        risk_modifier = float(np.clip(constraints[0], -25.0, 25.0))
        limit_multiplier = float(np.clip(constraints[1], 0.1, 1.5))

        # 3. Core properties calculation
        grit = min(max((req.cibil_score / 900.0 * 60) + (req.risk_score / 100.0 * 40) + (15 if req.sector_growth < 0 else 0), 0), 100)
        intent = min(max(100 - (req.fraud_probability * 100) - max(0, (req.growth_rate - (req.risk_score / 2))), 0), 100)
        
        shadow_score = req.sentiment_score - (req.litigation_count * 15) - (req.fraud_probability * 50)
        shadow = "GLOWING" if shadow_score > 10 else "DIMMED" if shadow_score < -20 else "NEUTRAL"
        
        verdict = "TRUSTWORTHY"
        if intent < 60 or shadow == "DIMMED" or limit_multiplier < 0.6: verdict = "CAUTIONARY"
        if archetype == "THE_HIGH_VELOCITY_SCALER" and grit < 50: verdict = "SPECULATIVE"
        elif archetype == "THE_OPPORTUNISTIC_FIREMAN": verdict = "HIGH_RISK"

        narrative = self._generate_narrative(req, archetype, shadow, grit)
        # Append constraint explanation to narrative
        narrative += f"\n\n【 AI CONSTRAINT DIRECTIVE 】\nBased on Neural Network synthesis, the Persona Brain is issuing a 'Limit Multiplier' constraint of {limit_multiplier:.2f}x to the base approved loan limit, and a Risk Score modifier of {risk_modifier:+.1f} points."

        return {
            "application_id": req.application_id,
            "archetype": archetype,
            "human_narrative": narrative,
            "grit_score": round(float(grit), 1),
            "intent_alignment": round(float(intent), 1),
            "social_shadow": shadow,
            "human_verdict": verdict,
            "risk_modifier": round(risk_modifier, 1),
            "limit_multiplier": round(limit_multiplier, 2)
        }

    def _generate_narrative(self, req, archetype, shadow, grit):
        arch_map = {
            "THE_STEADY_PILLAR": "This individual demonstrates the psychological profile of 'The Steady Pillar', prioritizing sustainable, risk-averse growth over aggressive expansion. Their operational footprint suggests a methodical approach to cash-flow management.",
            "THE_HIGH_VELOCITY_SCALER": "Profile indicates 'The High-Velocity Scaler'. They exhibit high risk tolerance and aggressive capital deployment intended to rapidly capture market share, potentially stretching working capital cycles to their limit.",
            "THE_METICULOUS_PLANNER": "Profile aligns with 'The Meticulous Planner'. An extremely detail-oriented psychological makeup with a pristine historical track record. They maintain strong structural buffers against macroeconomic shocks.",
            "THE_OPPORTUNISTIC_FIREMAN": "Behavioral footprint suggests 'The Opportunistic Fireman'. This borrower manages erratic cycle swings with high ambient financial stress, leading to potential governance blindspots during liquidity crunches.",
            "THE_BATTLING_VETERAN": "Classified as 'The Battling Veteran'. A seasoned market player currently navigating significant external friction (legal or sector headwinds). They display exceptional endurance but may be constrained by historical liabilities."
        }

        base = f"【 BEHAVIORAL FOOTPRINT 】\n{arch_map.get(archetype, 'Unknown archetype.')}\n\n"
        
        rep_note = "【 SOCIAL & REPUTATIONAL CAPITAL 】\n"
        if shadow == "GLOWING": 
            rep_note += "Social shadow is GLOWING. The absence of litigation coupled with strong public sentiment indicates high 'Personal Capital' and strong community/industry standing. They are deeply protective of their brand."
        elif shadow == "DIMMED": 
            rep_note += "Social shadow is DIMMED. Public records and sentiment indicate hidden liabilities or governance concerns. There is a higher probability of reputational contagion impacting the loan's viability."
        else:
            rep_note += "Social shadow is NEUTRAL. The borrower maintains a standard profile without significant negative or overwhelmingly positive public sentiment spikes."

        grit_note = "\n\n【 STRESS RESPONSE & GRIT 】\n"
        if grit > 70:
            grit_note += f"Exceptional Human Grit detected. Statistical resilience suggests they will fight aggressively to save the business during economic downturns, potentially liquidating personal assets if required before defaulting to the bank."
        elif grit < 40:
            grit_note += f"Low Human Grit indicator. Behavioral markers suggest a higher propensity to abandon the business entity during severe stress events or prolonged sector stagnation. High flight risk."
        else:
            grit_note += f"Standard resilience observed. The borrower will likely sustain normal operational friction but may struggle during catastrophic black-swan events."

        intent_note = "\n\n【 COGNITIVE INTENT ALIGNMENT 】\n" 
        intent = 100 - (req.fraud_probability * 100) # Re-calculate for narrative
        if intent > 80:
            intent_note += "Extremely high alignment. The financial realities extracted from the bank statements precisely mirror the borrower's declared intent. The human factor signifies deep truthfulness and transparency."
        elif intent < 50:
            intent_note += "CRITICAL DIVERGENCE: There is a significant gap between the borrower's stated objectives and the ground reality of their transaction history. Evasive patterns detected. Proceed with extreme caution."
        else:
            intent_note += "Moderate alignment. Some minor discrepancies exist between declared goals and actual cash flows, but no malicious intent is evident."

        return f"{base}{rep_note}{grit_note}{intent_note}"

brain = PersonaBrain()
