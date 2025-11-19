#!/bin/bash

echo "Starting Encephalic v2.0..."
echo ""
echo "This script will automatically:"
echo "  - Install all frontend dependencies (Node.js packages)"
echo "  - Install all backend dependencies (Python packages)"
echo "  - Build and start the complete application stack using Docker"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed."
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "Docker and Docker Compose are installed"
echo ""

# Stop any existing Docker containers first (they might be using the ports)
echo "Stopping any existing Docker containers..."
docker-compose down 2>/dev/null || true
docker stop encephalic-frontend encephalic-backend 2>/dev/null || true
docker rm encephalic-frontend encephalic-backend 2>/dev/null || true
sleep 2

# Kill any remaining processes using ports 3000 and 5000
echo "Checking for processes using ports 3000 and 5000..."
for port in 3000 5000; do
    # Try lsof first
    if command -v lsof &>/dev/null && lsof -ti:$port &>/dev/null; then
        echo "  Stopping process on port $port (using lsof)..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
    # Try fuser as fallback
    if command -v fuser &>/dev/null && fuser $port/tcp &>/dev/null 2>&1; then
        echo "  Stopping process on port $port (using fuser)..."
        fuser -k $port/tcp 2>/dev/null || true
    fi
done
sleep 1
echo ""
echo "Building and starting services..."
echo "This may take a few minutes on first run as dependencies are installed..."
echo ""

# Build with no cache to ensure latest changes are applied
# This prevents Docker from using outdated cached layers
if ! docker-compose build --no-cache; then
    echo ""
    echo "ERROR: Docker build failed!"
    echo "Please check the error messages above."
    exit 1
fi

echo ""
echo "Build successful! Starting services..."
echo ""
echo "Encephalic is starting!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo ""
echo "NOTE: Backend may take 30-60 seconds for first startup (downloading MNE sample data)"
echo "If containers fail to start, run: ./check-logs.sh"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Start the services and capture exit code
docker-compose up
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ] && [ $EXIT_CODE -ne 130 ]; then
    echo ""
    echo "ERROR: Docker Compose exited with code $EXIT_CODE"
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Run ./cleanup-ports.sh to free up ports"
    echo "  2. Run ./check-logs.sh to see container logs"
    echo "  3. Check for port conflicts: lsof -i:5000"
    exit $EXIT_CODE
fi
