# Stage 2: Create a lightweight runtime image
FROM alpine:latest

# Cài đặt CA certificates và tzdata (nếu cần thiết cho bảo mật và timezone)
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app/backend

# Copy the binary compiled on the host directly
COPY server /app/backend/server

# Expose port
EXPOSE 8080

# Run the executable
CMD ["./server"]
