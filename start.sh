#!/bin/bash

echo "Starting Encephalic v2.0..."
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed."
    echo "Please install docker-compose or use 'docker compose' instead."
    exit 1
fi

echo "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

echo ""
echo "Building Docker images..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose build

if [ $? -ne 0 ]; then
    echo ""
    echo "Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "Starting services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo ""
    echo "Failed to start services. Please check the errors above."
    exit 1
fi

echo ""
echo "Encephalic is now running!"
echo ""
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost:8000"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart"
echo ""
