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

# Aggressive cleanup of existing Docker resources
echo "Stopping and cleaning up any existing Docker containers..."

# Stop and remove containers with docker-compose (with volumes)
docker-compose down -v 2>/dev/null || true
sleep 1

# Force stop and remove specific containers
docker stop encephalic-frontend encephalic-backend 2>/dev/null || true
docker rm -f encephalic-frontend encephalic-backend 2>/dev/null || true
sleep 1

# Remove the encephalic network if it exists (this can hold port bindings)
echo "Cleaning up Docker networks..."
docker network rm encephalic-network 2>/dev/null || true
sleep 1

# Kill docker-proxy processes that might be holding ports
echo "Cleaning up Docker proxy processes..."
pkill -9 -f "docker-proxy.*5000" 2>/dev/null || true
pkill -9 -f "docker-proxy.*3000" 2>/dev/null || true
sleep 1

# Kill any remaining processes using ports 3000 and 5000
echo "Checking for processes using ports 3000 and 5000..."
for port in 3000 5000; do
    # Try lsof first
    if command -v lsof &>/dev/null && lsof -ti:$port &>/dev/null; then
        echo "  Stopping process on port $port (using lsof)..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    # Try fuser as fallback
    if command -v fuser &>/dev/null && fuser $port/tcp &>/dev/null 2>&1; then
        echo "  Stopping process on port $port (using fuser)..."
        fuser -k -9 $port/tcp 2>/dev/null || true
        sleep 1
    fi
    # Try netstat/ss to find processes
    if command -v ss &>/dev/null; then
        pid=$(ss -lptn "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1)
        if [ -n "$pid" ]; then
            echo "  Found process $pid on port $port, killing..."
            kill -9 $pid 2>/dev/null || true
            sleep 1
        fi
    fi
done

# Wait for ports to be released
echo "Waiting for ports to be fully released..."
sleep 3

# Verify ports are free
echo "Verifying ports are available..."
ports_in_use=false
for port in 3000 5000; do
    if command -v lsof &>/dev/null && lsof -ti:$port &>/dev/null; then
        echo "ERROR: Port $port is still in use!"
        ports_in_use=true
    fi
done

if [ "$ports_in_use" = true ]; then
    echo ""
    echo "Ports are still in use. Try these solutions:"
    echo "  1. Run: sudo lsof -ti:3000 | xargs kill -9 && sudo lsof -ti:5000 | xargs kill -9"
    echo "  2. Restart Docker: sudo systemctl restart docker (Linux) or restart Docker Desktop (Mac/Windows)"
    echo "  3. Use the cleanup script: ./cleanup-ports.sh"
    exit 1
fi

echo "Ports are available!"
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
