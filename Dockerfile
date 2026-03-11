# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# No external API URL needed — Spring Boot serves both frontend and API
RUN npm run build

# Stage 2: Build Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline
COPY src ./src
# Copy React build output into Spring Boot's static folder so it gets bundled into the jar
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests

# Stage 3: Build Python ML environment (Optional but cleaner)
FROM python:3.11-slim AS python-env
WORKDIR /app/ml-service
COPY ml-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ml-service/ .

# Stage 4: Final Monolithic Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# 1. Install Python 3.11 and dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Copy the artifacts
COPY --from=backend-build /app/target/*.jar app.jar
COPY --from=python-env /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-env /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY ml-service/ /app/ml-service/
COPY start.sh /app/start.sh

# 3. Final Prep
RUN chmod +x /app/start.sh
EXPOSE 8090
EXPOSE 8000
ENTRYPOINT ["/app/start.sh"]
