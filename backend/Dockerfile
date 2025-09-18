# Build stage
FROM golang:1.22-alpine AS builder

# Set working directory
WORKDIR /app

# Install git and ca-certificates (needed for go mod download)
RUN apk add --no-cache git ca-certificates

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/app/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

# Create app directory
WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy Firebase service account file
COPY --from=builder /app/boiboi-775e3-firebase-adminsdk-whdew-ee9f66987e.json .

# Copy email templates
COPY --from=builder /app/utils/templates ./utils/templates

# Expose port
EXPOSE 8082

# Run the application
CMD ["./main"]
