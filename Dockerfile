# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/dashboard
COPY dashboard/package*.json ./
RUN npm install
COPY dashboard/ ./
RUN npm run build

# Stage 2: Build the Go Backend
FROM golang:latest AS backend-builder
WORKDIR /app/backend
COPY backend/ ./
RUN go mod tidy
RUN go build -o server main.go

# Stage 3: Final Runtime Image
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies required for geopandas and other ML tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Go backend including the server binary and audit files
COPY --from=backend-builder /app/backend /app/backend

# Copy React built static files
COPY --from=frontend-builder /app/dashboard/dist /app/dashboard/dist

# Copy python scripts and data
COPY data/ ./data/
COPY artifacts/ ./artifacts/
COPY scripts/ ./scripts/
COPY *.py ./

# Ensure artifacts directory is writable
RUN mkdir -p /app/artifacts && chmod 777 /app/artifacts
RUN chmod 777 /app/backend/system_audit.jsonl

# Expose the single port 8080 which will serve BOTH frontend and backend
EXPOSE 8080

# Run the Go server from the backend directory
WORKDIR /app/backend
CMD ["./server"]
