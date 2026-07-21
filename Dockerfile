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
COPY backend/go.* ./
RUN go mod tidy
COPY backend/main.go ./
RUN go build -o server main.go

# Stage 3: Final Runtime Image (Python + ML tools + Go binary + React static files)
FROM python:3.10-slim
WORKDIR /app

# Install ML dependencies
RUN pip install --no-cache-dir pandas scikit-learn numpy dimod

# Copy Go binary
COPY --from=backend-builder /app/backend/server /app/backend/server

# Copy React built static files
COPY --from=frontend-builder /app/dashboard/dist /app/dashboard/dist

# Copy python scripts and data
COPY data/ ./data/
COPY artifacts/ ./artifacts/
COPY scripts/ ./scripts/
COPY *.py ./

# Ensure artifacts directory is writable
RUN mkdir -p /app/artifacts && chmod 777 /app/artifacts

# Expose the single port 8080 which will serve BOTH frontend and backend
EXPOSE 8080

# Run the Go server from the backend directory (it expects to run from here)
WORKDIR /app/backend
CMD ["./server"]
