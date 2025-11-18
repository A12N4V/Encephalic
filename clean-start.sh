#!/bin/bash

echo "Starting Encephalic v2.0 with clean build..."
echo ""
echo "This script will:"
echo "  - Stop any running containers"
echo "  - Remove old containers and images"
echo "  - Rebuild everything from scratch (no cache)"
echo "  - Start the application"
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

# Stop and remove existing containers
echo "Stopping and removing existing containers..."
docker-compose down

# Remove old images to force a complete rebuild
echo "Removing old images..."
docker-compose rm -f

# Build without cache
echo "Building with no cache (this may take several minutes)..."
docker-compose build --no-cache

# Start the services
echo "Starting services..."
docker-compose up

echo ""
echo "Encephalic is now running!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the application"
