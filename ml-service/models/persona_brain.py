import random

class PersonaBrain:
    """
    Simulates a 'Digital Twin' or 'Cognitive Brain' of the borrower's management.
    Takes macro-economic pressures and company profile to simulate responses
    to hypothetical stress-test scenarios, outputting a behavioral resilience score.
    """
    
    def simulate(self, company_name: str, sector: str, turnover: float, 
                 capacity_utilization: int, promoter_assessment: str, 
                 legal_concerns: bool):
        
        print(f"[PersonaBrain] Instantiating cognitive simulation for {company_name}")
        
        # 1. Generate Contextual Pressures based on Sector and Profile
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
            
        # 2. Formulate the Pre-Cognitive Psychological Profile
        resilience_base = 50.0
        if promoter_assessment.upper() == "STRONG":
            resilience_base += 20
        elif promoter_assessment.upper() == "NEUTRAL":
            resilience_base += 5
        else:
            resilience_base -= 20
            
        if not legal_concerns:
            resilience_base += 10
        if capacity_utilization > 75:
            resilience_base += 15

        # 3. Simulate Scenarios
        scenarios = [
            {"id": "S1", "question": "Your primary buyer delays payment by 60 days. How do you cover payroll and your upcoming EMI?"},
            {"id": "S2", "question": "A new competitor enters the market undercutting your prices by 10%. What is your strategic response?"}
        ]
        
        # Responses will be deterministically derived from the resilience base but varied for narrative
        responses = []
        
        if resilience_base > 70:
            responses.append({"scenario_id": "S1", "response": "We will draw down on our pre-approved working capital buffer. We maintain a strict cash-reserve policy for 3 months of OPEX. We will also penalize the buyer on future consignments to enforce discipline."})
            responses.append({"scenario_id": "S2", "response": "We will not engage in a price war. Instead, we are fast-tracking our premium product line to differentiate our offering, relying on our superior quality metrics and existing B2B relationships."})
            behavior_adjustment = 10
            sentiment = "HIGH_RESILIENCE"
        elif resilience_base > 40:
            responses.append({"scenario_id": "S1", "response": "We will try to negotiate a short-term overdraft with our primary banker. Payroll might be slightly delayed for upper management, but we will ensure line workers and EMIs are paid to avoid default."})
            responses.append({"scenario_id": "S2", "response": "We will have to match the competitor's pricing temporarily on bulk orders to retain market share, though this will compress our margins by 4-5% this quarter."})
            behavior_adjustment = 0
            sentiment = "MODERATE_RESILIENCE"
        else:
            responses.append({"scenario_id": "S1", "response": "We have no immediate buffer. We will have to halt production to conserve cash and potentially request an EMI moratorium. We are highly dependent on this single buyer."})
            responses.append({"scenario_id": "S2", "response": "We cannot compete on price. We may lose up to 30% of our market share and will need to lay off workers to survive the cash flow contraction."})
            behavior_adjustment = -15
            sentiment = "LOW_RESILIENCE"
            
        return {
            "cognitive_profile": "Aggressive Growth but Cash-Strapped" if capacity_utilization > 80 and resilience_base < 60 else ("Conservative & Stable" if resilience_base > 60 else "Vulnerable & Reactive"),
            "simulated_pressures": pressures,
            "scenarios_tested": scenarios,
            "simulated_responses": responses,
            "behavioral_resilience_score": max(0.0, min(100.0, resilience_base + random.uniform(-5, 5))),
            "assurance_adjustment": behavior_adjustment,
            "sentiment": sentiment
        }

brain_simulator = PersonaBrain()
