#!/bin/bash

echo "=== Encephalic Port Cleanup Tool ==="
echo ""
echo "This script will forcefully clean up ports 3000 and 5000"
echo ""

# Stop all Docker containers
echo "1. Stopping all Docker containers..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker-compose down --remove-orphans 2>/dev/null || true

# Remove specific containers
echo "2. Removing Encephalic containers..."
docker rm -f encephalic-frontend encephalic-backend 2>/dev/null || true

# Kill processes on ports
echo "3. Killing processes on ports 3000 and 5000..."
for port in 3000 5000; do
    echo "   Checking port $port..."

    # Try lsof
    if command -v lsof &>/dev/null; then
        sudo lsof -ti:$port | xargs sudo kill -9 2>/dev/null || true
    fi

    # Try fuser
    if command -v fuser &>/dev/null; then
        sudo fuser -k $port/tcp 2>/dev/null || true
    fi
done

sleep 2

# Verify ports are free
echo ""
echo "4. Verifying ports are free..."
for port in 3000 5000; do
    if command -v lsof &>/dev/null && lsof -i:$port &>/dev/null; then
        echo "   WARNING: Port $port is still in use!"
        lsof -i:$port
    else
        echo "   Port $port is free ✓"
    fi
done

echo ""
echo "Cleanup complete! You can now run ./start.sh"
