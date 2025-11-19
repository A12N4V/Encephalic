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
pkill -9 -f "docker-proxy.*8000" 2>/dev/null || true
pkill -9 -f "docker-proxy.*80" 2>/dev/null || true
sleep 1

# Kill any remaining processes using ports 80 and 8000
echo "Checking for processes using ports 80 and 8000..."
for port in 80 8000; do
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

# Wait for ports to be released (sockets may be in TIME_WAIT state)
echo "Waiting for ports to be fully released..."
sleep 5

# Function to check if port can be bound (more reliable than lsof)
check_port_available() {
    local port=$1
    # Try to bind to the port using Python (most reliable method)
    python3 -c "import socket; s = socket.socket(); s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1); s.bind(('0.0.0.0', $port)); s.close()" 2>/dev/null
    return $?
}

# Verify ports are free by actually trying to bind to them (with retry logic)
echo "Verifying ports are available..."
max_retries=3
retry_count=0
ports_in_use=false

while [ $retry_count -lt $max_retries ]; do
    ports_in_use=false

    for port in 80 8000; do
        if ! check_port_available $port; then
            if [ $retry_count -eq 0 ]; then
                echo "  Port $port is not yet available (may be in TIME_WAIT state)..."
            fi
            ports_in_use=true
        else
            if [ $retry_count -eq 0 ]; then
                echo "  Port $port is available"
            fi
        fi
    done

    # If all ports are available, break out of retry loop
    if [ "$ports_in_use" = false ]; then
        if [ $retry_count -gt 0 ]; then
            echo "  All ports are now available!"
        fi
        break
    fi

    # If we haven't exhausted retries, wait and try again
    retry_count=$((retry_count + 1))
    if [ $retry_count -lt $max_retries ]; then
        wait_time=$((5 * retry_count))
        echo "  Waiting ${wait_time} seconds for ports to be released (attempt $((retry_count + 1))/$max_retries)..."
        sleep $wait_time
    fi
done

# If ports are still in use after all retries, show error
if [ "$ports_in_use" = true ]; then
    echo ""
    echo "ERROR: Ports are still in use after cleanup attempts!"
    echo ""
    # Show what's using the ports for debugging
    for port in 80 8000; do
        if ! check_port_available $port; then
            echo "Port $port details:"
            if command -v lsof &>/dev/null; then
                lsof -i :$port 2>/dev/null | head -5 || echo "  No active process found (socket may be in TIME_WAIT state)"
            fi
            if command -v netstat &>/dev/null; then
                netstat -an 2>/dev/null | grep ":$port " | head -3 || true
            fi
            echo ""
        fi
    done

    echo "Try these solutions:"
    echo "  1. Wait 30-60 seconds for sockets in TIME_WAIT state to clear, then run this script again"
    echo "  2. Run: lsof -ti:80 -ti:8000 | xargs kill -9"
    echo "  3. Restart Docker: sudo systemctl restart docker (Linux) or restart Docker Desktop (Mac/Windows)"
    echo "  4. Reboot your system to force clear all socket states"
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
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the application"
