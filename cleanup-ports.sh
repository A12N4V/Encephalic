#!/bin/bash

echo "=== Encephalic Port Cleanup Utility ==="
echo ""
echo "This script will forcefully clean up ports 3000 and 5000"
echo ""

# Stop Docker containers
echo "Stopping Docker containers..."
docker-compose down -v 2>/dev/null || true
docker stop encephalic-frontend encephalic-backend 2>/dev/null || true
docker rm -f encephalic-frontend encephalic-backend 2>/dev/null || true

# Remove Docker network
echo "Removing Docker network..."
docker network rm encephalic-network 2>/dev/null || true

# Kill docker-proxy processes
echo "Killing docker-proxy processes..."
pkill -9 -f "docker-proxy.*5000" 2>/dev/null || true
pkill -9 -f "docker-proxy.*3000" 2>/dev/null || true
sleep 1

# Clean up ports
for port in 3000 5000; do
    echo ""
    echo "Cleaning up port $port..."

    # Method 1: lsof
    if command -v lsof &>/dev/null; then
        if lsof -ti:$port &>/dev/null; then
            echo "  Found process using lsof, killing..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    fi

    # Method 2: fuser
    if command -v fuser &>/dev/null; then
        if fuser $port/tcp &>/dev/null 2>&1; then
            echo "  Found process using fuser, killing..."
            fuser -k -9 $port/tcp 2>/dev/null || true
        fi
    fi

    # Method 3: ss/netstat
    if command -v ss &>/dev/null; then
        pid=$(ss -lptn "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1)
        if [ -n "$pid" ]; then
            echo "  Found process $pid using ss, killing..."
            kill -9 $pid 2>/dev/null || true
        fi
    elif command -v netstat &>/dev/null; then
        pid=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
        if [ -n "$pid" ]; then
            echo "  Found process $pid using netstat, killing..."
            kill -9 $pid 2>/dev/null || true
        fi
    fi

    sleep 1
done

echo ""
echo "Waiting for ports to be released..."
sleep 3

# Verify
echo ""
echo "Verifying ports are now free..."
all_clear=true
for port in 3000 5000; do
    if command -v lsof &>/dev/null && lsof -ti:$port &>/dev/null; then
        echo "  ❌ Port $port is STILL IN USE"
        all_clear=false
        lsof -i:$port
    else
        echo "  ✓ Port $port is free"
    fi
done

echo ""
if [ "$all_clear" = true ]; then
    echo "✓ All ports are clear! You can now run ./start.sh"
else
    echo "⚠ Some ports are still in use. You may need to manually kill these processes:"
    echo "  sudo lsof -ti:3000 | xargs kill -9"
    echo "  sudo lsof -ti:5000 | xargs kill -9"
fi
