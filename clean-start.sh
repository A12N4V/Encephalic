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
if ! docker-compose build --no-cache; then
    echo ""
    echo "ERROR: Docker build failed!"
    echo ""
    echo "Possible causes:"
    echo "  1. Docker daemon is not running"
    echo "     - On Mac/Windows: Start Docker Desktop"
    echo "     - On Linux: sudo systemctl start docker"
    echo "  2. Docker daemon socket permission issues"
    echo "  3. Insufficient disk space or memory"
    echo ""
    echo "Please fix the issue and try again."
    exit 1
fi

# Start the services
echo "Starting services..."
if ! docker-compose up -d; then
    echo ""
    echo "ERROR: Failed to start Docker services!"
    echo ""
    echo "Possible causes:"
    echo "  1. Docker daemon is not running"
    echo "  2. Port conflicts (ports 80 or 8000 may still be in use)"
    echo "  3. Container configuration issues"
    echo ""
    echo "Check the errors above and try again."
    exit 1
fi

# Verify services are actually running
echo ""
echo "Verifying services started successfully..."
sleep 2

if ! docker-compose ps | grep -q "Up"; then
    echo ""
    echo "ERROR: Services failed to start!"
    echo ""
    echo "Running containers status:"
    docker-compose ps
    echo ""
    echo "Check the logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "Encephalic is now running!"
echo ""
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:8000"
echo ""
echo "View logs with: docker-compose logs -f"
echo "Press Ctrl+C or run 'docker-compose down' to stop the application"
