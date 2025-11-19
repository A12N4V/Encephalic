#!/bin/bash

set -e  # Exit on error

echo "Starting Encephalic v2.0..."
echo ""
echo "This script will automatically:"
echo "  - Clean up any existing containers and processes"
echo "  - Install all frontend dependencies (Node.js packages)"
echo "  - Install all backend dependencies (Python packages)"
echo "  - Build and start the complete application stack using Docker"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed."
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed."
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Cleanup function
cleanup() {
    echo "🧹 Cleaning up existing containers and processes..."

    # Stop and remove containers
    docker-compose down --remove-orphans -v 2>/dev/null || true

    # Force remove specific containers
    docker rm -f encephalic-backend encephalic-frontend 2>/dev/null || true

    # Kill processes on ports 3000, 3001, 5000, 5001
    for port in 3000 3001 5000 5001; do
        if lsof -ti:$port &>/dev/null; then
            echo "  → Stopping process on port $port..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done

    # Remove any dangling networks
    docker network rm encephalic-network 2>/dev/null || true

    # Wait for cleanup to complete
    sleep 3

    echo "✓ Cleanup complete"
    echo ""
}

# Run cleanup
cleanup

echo "🔨 Building Docker containers..."
echo "This may take a few minutes on first run as dependencies are installed..."
echo ""

# Build with no cache
if ! docker-compose build --no-cache; then
    echo ""
    echo "❌ Build failed!"
    echo "Please check the error messages above."
    exit 1
fi

echo ""
echo "✓ Build successful!"
echo ""
echo "🚀 Starting services..."
echo ""

# Start services in detached mode
if ! docker-compose up -d; then
    echo ""
    echo "❌ Failed to start services!"
    echo "Please check the error messages above."
    exit 1
fi

# Wait for containers to start
sleep 5

# Check if containers are actually running
BACKEND_RUNNING=$(docker ps --filter "name=encephalic-backend" --filter "status=running" -q)
FRONTEND_RUNNING=$(docker ps --filter "name=encephalic-frontend" --filter "status=running" -q)

if [ -z "$BACKEND_RUNNING" ] || [ -z "$FRONTEND_RUNNING" ]; then
    echo ""
    echo "❌ Containers failed to start properly!"
    echo ""
    echo "Checking container logs..."
    echo ""
    echo "=== Backend logs ==="
    docker logs encephalic-backend 2>&1 | tail -20
    echo ""
    echo "=== Frontend logs ==="
    docker logs encephalic-frontend 2>&1 | tail -20
    echo ""
    echo "Run 'docker-compose logs' for full logs"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════"
echo "  ✅ Encephalic is now running successfully!"
echo "════════════════════════════════════════════════"
echo ""
echo "  🌐 Frontend:    http://localhost:3001"
echo "  🔧 Backend API: http://localhost:5001"
echo ""
echo "  📊 Container Status:"
echo "     Backend:  ✓ Running"
echo "     Frontend: ✓ Running"
echo ""
echo "════════════════════════════════════════════════"
echo ""
echo "  📝 Useful commands:"
echo "     View logs:     docker-compose logs -f"
echo "     Stop app:      docker-compose down"
echo "     Restart:       ./start.sh"
echo ""
echo "  Press Ctrl+C to view logs (containers will keep running)"
echo ""

# Follow logs
docker-compose logs -f
