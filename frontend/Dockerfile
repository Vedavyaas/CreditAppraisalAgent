# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Use a cache mount to speed up npm install
RUN --mount=type=cache,target=/root/.npm npm install
COPY . .
# We use relative URLs now, so we can set a dummy build-time URL or just root
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
