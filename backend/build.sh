#!/bin/bash

# Build script for Boiboi Backend
echo "Building Boiboi Backend..."

# Download dependencies
echo "Downloading dependencies..."
go mod download

# Build the application
echo "Building application..."
go build -o main cmd/app/main.go

echo "Build completed successfully!"
