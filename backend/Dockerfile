# Stage 1: Build the Go binary
FROM golang:alpine AS builder

WORKDIR /build

# Copy source code
COPY . .

# Download dependencies and build the binary
# Disable CGO for a static binary that runs seamlessly on Alpine
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o /build/server main.go

# Stage 2: Create a lightweight runtime image
FROM alpine:latest

# Cài đặt CA certificates và tzdata (nếu cần thiết cho bảo mật và timezone)
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app/backend

# Copy the binary from the builder stage
COPY --from=builder /build/server /app/backend/server

# Expose port
EXPOSE 8080

# Run the executable
CMD ["./server"]
