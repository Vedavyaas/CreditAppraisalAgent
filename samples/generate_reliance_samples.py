import csv
from datetime import datetime, timedelta
import random

def generate_reliance_data():
    # 🏢 Reliance Specific Identity
    name = "RELIANCE INDUSTRIES LIMITED"
    gstn = "27AAACR1234A1Z1"
    
    # ── 1. Reliance GST History (12 Months) ──
    # Simulating massive revenue with high-confidence compliance
    gst_file = "samples/reliance_gst.csv"
    with open(gst_file, mode='w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["period", "gstr3bTurnover", "gstr2aTurnover"])
        
        base_revenue = 650000000.0  # ₹65 Crore monthly average
        for i in range(1, 13):
            month = f"2024-{i:02d}"
            # Low variance (5-8%) to show "SAFE" status
            g3b = round(base_revenue + random.uniform(-5000000, 5000000), 2)
            g2a = round(g3b * 0.94, 2)  # Healthy reconciliation
            writer.writerow([month, g3b, g2a])
            
    # ── 2. Reliance Bank Ledger (50 Transactions) ──
    bank_file = "samples/reliance_bank.csv"
    with open(bank_file, mode='w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["date", "description", "credit", "debit", "balance"])
        
        balance = 1200000000.0  # Start with ₹120 Crore
        current_date = datetime(2024, 1, 1)
        
        for i in range(50):
            tx_type = random.choices(["INFLOW", "OUTFLOW"], weights=[0.4, 0.6])[0]
            amount = round(random.uniform(5000000, 25000000), 2)
            
            if tx_type == "INFLOW":
                desc = random.choice([f"DEPOSIT FROM PETRO-DIVISION #{i}", f"GST REFUND - Q{i//10}", "LIQUIDITY SWEEP"])
                credit = amount
                debit = 0.0
                balance += amount
            else:
                desc = random.choice([f"VENDOR PAYMENT - BPCL-RECON #{i}", "PAYROLL BATCH - MUMBAI HQ", f"UTILITY SETTLEMENT #{i}"])
                credit = 0.0
                debit = amount
                balance -= amount
            
            writer.writerow([current_date.strftime("%Y-%m-%d"), desc, credit, debit, round(balance, 2)])
            current_date += timedelta(days=random.randint(2, 6))

    print(f"Generated data for {name}:")
    print(f"- GST History: {gst_file}")
    print(f"- Bank Ledger: {bank_file}")

if __name__ == "__main__":
    generate_reliance_data()
