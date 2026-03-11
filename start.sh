#!/bin/bash

# Start the Python ML Service (FastAPI) on port 8000
echo "Starting Python ML Service on port 8000..."
cd /app/ml-service && /usr/local/bin/uvicorn main:app --host 0.0.0.0 --port 8000 &

# Start the Java Spring Boot Backend on port 8090
echo "Starting Java Backend on port 8090..."
cd /app && java -jar app.jar

