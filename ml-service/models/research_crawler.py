import requests
from bs4 import BeautifulSoup
import time
import random

class ResearchCrawler:
    """
    Simulates a Research Web Crawler for Corporate Master Data.
    Targets public databases (Zaubacorp search mockup logic).
    
    In a live production scenario, this would use Playwright or a paid API
    like The Legal 500 or Probe42. For the demo, it scrapes master data
    and uses sentiment logic.
    """
    
    def __init__(self):
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
        ]

    def crawl(self, company_name: str, cin: str = None):
        """
        Main entry point to fetch master data and news sentiment.
        """
        search_query = cin if cin else company_name
        print(f"[Crawler] Searching public records for: {search_query}")
        
        master_data = self._mock_scrape_master_data(company_name, cin)
        sentiment_data = self._simulate_news_sentiment(company_name)
        cibil_data = self._mock_cibil_data()
        sector_data = self._mock_sector_data(company_name)
        
        return {
            **master_data,
            **sentiment_data,
            **cibil_data,
            **sector_data,
            "source": "AGENT_PHEONIX_CRAWLERv1.0"
        }

    def _mock_scrape_master_data(self, name, cin):
        is_active = random.choice([True, True, True, False])
        # Force Reliance/TCS/Infosys to be Active
        if name and any(x in name.upper() for x in ["RELIANCE", "TATA", "INFOSYS"]):
            is_active = True

        return {
            "mca_cin": cin if cin else f"U{random.randint(10000, 99999)}KA20{random.randint(10, 23)}PTC{random.randint(100000, 999999)}",
            "mca_status": "Active" if is_active else "Inactive",
            "is_active": is_active,
            "paid_up_capital": f"₹ {random.randint(400, 90000)} Lakhs",
            "director_count": random.randint(3, 8),
            "registration_date": f"20{random.randint(10, 20)}-{random.randint(1, 12):02d}-01",
            "litigation_count": 0 if is_active else random.randint(1, 5),
            "litigation_note": "No material legal risks found in public records." if is_active else "Pending civil litigation in High Court.",
            "dgft_alerts": "None"
        }

    def _simulate_news_sentiment(self, name):
        sentiments = ["POSITIVE", "NEUTRAL", "POSITIVE", "NEGATIVE", "NEUTRAL"]
        weights = [0.4, 0.4, 0.1, 0.05, 0.05]
        choice = random.choices(sentiments, weights=weights)[0]
        
        # Mocking news items list as expected by ResearchData response
        news_items = [
            {"headline": f"{name} announces expansion into new markets.", "source": "Economic Times", "date": "2024-03-01", "sentiment": "POSITIVE"},
            {"headline": f"Quarterly earnings for {name} stay resilient.", "source": "CNBC-TV18", "date": "2024-02-15", "sentiment": "NEUTRAL"}
        ]
        
        return {
            "news_sentiment": choice,
            "news_items": news_items
        }

    def _mock_cibil_data(self):
        score = random.randint(680, 850)
        return {
            "cibil_score": score,
            "cibil_grade": "A" if score > 750 else "B",
            "cibil_loans": random.randint(5, 50),
            "cibil_overdue": 0
        }

    def _mock_sector_data(self, name):
        return {
            "sector_name": "Conglomerate" if "RELIANCE" in name.upper() else "IT Services",
            "sector_growth": 12.5,
            "sector_headwind": "Global interest rate volatility may impact margins.",
            "rbi_note": "RBI maintaining neutral policy for large-cap industrial loans."
        }

crawler = ResearchCrawler()
