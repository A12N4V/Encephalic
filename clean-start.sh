#!/bin/bash

echo "Clean build: Rebuilding Encephalic from scratch..."
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed."
    exit 1
fi

echo "Stopping and removing existing containers..."
docker-compose down -v 2>/dev/null || true

echo ""
echo "Removing old images..."
docker-compose rm -f 2>/dev/null || true

echo ""
echo "Building with no cache (this may take several minutes)..."
docker-compose build --no-cache

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
echo ""
