FROM golang:latest AS builder

WORKDIR /app
# Build backend
COPY backend/main.go backend/go.* ./
# (If there is a go.sum, it would be copied here, but it's okay to skip if not present or let go mod tidy run)
RUN go mod tidy
RUN go build -o server main.go

# Final stage with Python
FROM python:3.10-slim

# Install dependencies for python
RUN pip install --no-cache-dir pandas scikit-learn numpy dimod

WORKDIR /app/backend

# Copy backend binary
COPY --from=builder /app/server /app/backend/server

# Copy python scripts and data to root /app (since Go server executes them with cmd.Dir = "..")
WORKDIR /app
COPY data/ ./data/
COPY artifacts/ ./artifacts/
COPY scripts/ ./scripts/
COPY *.py ./

# Make artifacts dir writable
RUN mkdir -p /app/artifacts && chmod 777 /app/artifacts

WORKDIR /app/backend
EXPOSE 8080

CMD ["./server"]
