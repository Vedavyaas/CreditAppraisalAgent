# Credit Appraisal Memo (CAM) Platform 🚀

A full-stack, AI-powered credit underwriting and compliance system designed for modern financial institutions. 

![Architecture](https://img.shields.io/badge/Architecture-Distributed_System-indigo)
![Stack](https://img.shields.io/badge/Stack-Spring_Boot_+_React_+_FastAPI-blue)
![Deployment](https://img.shields.io/badge/Deployment-Docker_Compose-blueviolet)

## 🌟 Overview
The CAM Platform automates the ingestion of GST, Bank, and Financial documents to generate a comprehensive **Credit Appraisal Memo**. It features an intelligent **Compliance Hub** for fraud detection, an **ML-Driven Engine** for risk scoring and revenue forecasting, an autonomous **Research Agent** for real-time web-based due diligence, and a state-of-the-art **Cognitive Persona Brain** (Neural Network Automata) that creates a Digital Twin of the borrower to stress-test behavioral resilience.

## 🏗️ Project Structure
- **/frontend**: React 19 + Vite (TS) Dashboards featuring a premium Light-Mode Glassmorphism UI.
- **/src**: Java 17 + Spring Boot Backend (Core Logic, Spring Batch Jobs, Security, Audit Logging).
- **/ml-service**: Python FastAPI service hosting scikit-learn models (Isolation Forest, Logistic Regression).
- **docker-compose.yml**: Orchestrates all services for one-click deployment.

## 🚀 Quick Start (Docker)
Ensure you have Docker and Docker Compose installed.

```bash
# Clone the repository and navigate to root
git clone <your-repo-url>
cd CreditAppraisalMemo

# Start all services
docker-compose up --build
```

- **Dashboards**: `http://localhost:3000`
- **Backend API**: `http://localhost:8090/api`
- **ML Docs (Swagger)**: `http://localhost:8000/docs`

## 💎 Features
- **Cognitive Persona Brain (Digital Twin)**: A dynamic Neural Network Automata (MLPRegressor) that processes a 7-parameter State Vector (including CIBIL, Income, Debt, Macroeconomics) to predict borrower behavioral probabilities (Default, Pay on Time, etc.) under extreme stress scenarios.
- **Intelligent Ingestion**: Automated CSV/PDF parsing using Spring Batch robust pipelines.
- **Fraud Detection**: Scikit-Learn Isolation Forest models detecting circular trading patterns.
- **Explainable AI Engine**: Comprehensive risk scoring based on the 5 C's of credit, featuring detailed reasoning and qualitative adjustments.
- **Research Agent**: Autonomous web scraper fetching real-time ECourts litigations, DGFT alerts, and industry news.
- **Premium UX**: High-end light-mode glassmorphic design tailored for compliance, risk, and executive roles.
- **Action-Oriented Audit Logging**: Precise, readable logging of actions for compliance tracking and system oversight.
- **Executive Oversight**: Transparency Hub for real-time portfolio monitoring.

## 🛠️ Tech Stack
- **Backend**: Java 17, Spring Boot, Spring Security, Spring Batch, Hibernate, H2 Database.
- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Vite.
- **AI/ML**: Python, FastAPI, Scikit-learn, Numpy, BeautifulSoup4 (Scraping).
- **Deployment**: Docker, Nginx, Neural Build pipeline.

## 🔐 Credentials (Demo)
The application is pre-seeded with realistic Indian corporate credit data. Use the following credentials to explore different role-based views:

| Role | Email | Password | Dashboard Features |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@test.com` | `password` | System configuration, Rule thresholds, User management |
| **Credit Manager** | `manager@test.com` | `password` | Portfolio overview, Final approvals, Pipeline oversight |
| **Credit Officer** | `credit@test.com` | `password` | Draft Memos, Qualitative notes, App data entry |
| **Compliance Officer** | `compliance@test.com` | `password` | Fraud/Circular trading alerts, Audit logs |
| **Risk Analyst** | `analyst@test.com` | `password` | ML Explanations, Scrutiny of High-Risk files |
| **Executive Viewer** | `viewer@test.com` | `password` | Read-only transparent analytics |

---
*Built with ❤️ for modern credit underwriting. Scalable, Secure, and AI-Enhanced.*
