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

# Step 1: Stop and remove any existing containers first
echo "Stopping any existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Step 2: Force remove specific containers if they still exist
echo "Removing any lingering Encephalic containers..."
docker rm -f encephalic-backend encephalic-frontend 2>/dev/null || true

# Step 3: Kill any processes using ports 3000 and 5000
echo "Checking for processes using ports 3000 and 5000..."
if lsof -ti:3000 &>/dev/null; then
    echo "  Stopping process on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi
if lsof -ti:5000 &>/dev/null; then
    echo "  Stopping process on port 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
fi

# Step 4: Wait a moment for ports to be fully released
sleep 2

echo ""
echo "Building and starting services..."
echo "This may take a few minutes on first run as dependencies are installed..."
echo ""

# Build with no cache to ensure latest changes are applied
# This prevents Docker from using outdated cached layers
docker-compose build --no-cache

# Start the services
docker-compose up

echo ""
echo "Encephalic is now running!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the application"
