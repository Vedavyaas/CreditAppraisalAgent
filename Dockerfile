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

# Stage 3: Run
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]
