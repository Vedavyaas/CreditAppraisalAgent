# Credit Appraisal Memo (CAM) Platform 🚀

A full-stack, AI-powered credit underwriting and compliance system designed for modern financial institutions.

![Architecture](https://img.shields.io/badge/Architecture-Distributed_System-indigo)
![Stack](https://img.shields.io/badge/Stack-Spring_Boot_+_React_+_FastAPI-blue)
![Docker](https://img.shields.io/badge/Deployment-Docker_Compose-blueviolet)

## 🌟 Overview
The CAM Platform automates the ingestion of GST, Bank, and Financial documents to generate a comprehensive **Credit Appraisal Memo**. It features an intelligent **Compliance Hub** for fraud detection and an **ML-Driven Engine** for risk scoring and revenue forecasting.

## 🏗️ Project Structure
- **/frontend**: React + Vite (TS) Dashboard with Glassmorphism UI.
- **/src**: Java Spring Boot Backend (Core Logic, Batch Jobs, Security).
- **/ml-service**: Python FastAPI service hosting scikit-learn ML models.
- **docker-compose.yml**: Orchestrates all services for one-click deployment.

## 🚀 Quick Start (Docker)
Ensure you have Docker and Docker Compose installed.

```bash
# Clone the repository and navigate to root
cd CreditAppraisalMemo

# Start all services
docker-compose up --build
```

- **Dashboards**: `http://localhost:3000`
- **Backend API**: `http://localhost:8090/api`
- **ML Docs**: `http://localhost:8000/docs`

## 💎 Features
- **Intelligent Ingestion**: Automated CSV/PDF parsing via Spring Batch.
- **Fraud Detection**: Isolation Forest models to detect circular trading.
- **Explainable AI**: Risk scores with detailed reasoning and qualitative adjustments.
- **Premium UX**: High-end light-mode glassmorphic design for compliance and risk roles.
- **Executive Oversight**: Transparency Hub for real-time portfolio monitoring.

## 🛠️ Tech Stack
- **Backend**: Java 17, Spring Boot, Spring Batch, Hibernate, H2.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion.
- **AI/ML**: Python, FastAPI, Scikit-learn (Logistic Regression, Ridge, Isolation Forest).
- **Deployment**: Docker, Nginx.

## 🔐 Credentials (Demo)
| Role | Email | Password |
| :--- | :--- | :--- |
| **Credit Manager** | `manager@test.com` | `password` |
| **Credit Officer** | `credit@test.com` | `password` |
| **Compliance Officer** | `compliance@test.com` | `password` |
| **Risk Analyst** | `analyst@test.com` | `password` |
| **Executive Viewer** | `viewer@test.com` | `password` |

---
*Built with ❤️ for modern credit underwriting.*
