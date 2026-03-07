import csv
import random
import os
from datetime import datetime, timedelta

def generate_csv(filename, num_rows):
    headers = ["TransactionDate", "Description", "DebitAmount", "CreditAmount", "Balance"]
    
    start_date = datetime(2023, 1, 1)
    balance = 50000.00
    
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(headers)
        
        current_date = start_date
        for i in range(num_rows):
            # Move forward between 0 and 2 days
            current_date += timedelta(days=random.randint(0, 2))
            
            is_credit = random.choice([True, False])
            debit_amt = 0.0
            credit_amt = 0.0
            
            if is_credit:
                credit_amt = round(random.uniform(100.0, 50000.0), 2)
                balance += credit_amt
                desc = random.choice(["INWARD REMITTANCE", "SALARY", "CASH DEPOSIT", "REFUND", "NEFT TRANSFER"])
            else:
                debit_amt = round(random.uniform(50.0, 20000.0), 2)
                balance -= debit_amt
                desc = random.choice(["ATM WITHDRAWAL", "POS PURCHASE", "UTILITY BILL", "EMI DEBIT", "IMPS TRANSFER"])
                
            writer.writerow([
                current_date.strftime("%Y-%m-%d"),
                desc,
                f"{debit_amt:.2f}" if debit_amt > 0 else "",
                f"{credit_amt:.2f}" if credit_amt > 0 else "",
                f"{balance:.2f}"
            ])

print("Generating 10,000 rows CSV...")
generate_csv('/Users/vedavyaasmr/IdeaProjects/CreditAppraisalMemo/frontend/public/sample_bank_statement_large.csv', 10000)
print("Generating dummy PDF...")
os.system('echo "This is a dummy PDF file for testing." > /Users/vedavyaasmr/IdeaProjects/CreditAppraisalMemo/frontend/public/sample_document.pdf')
print("Done!")
