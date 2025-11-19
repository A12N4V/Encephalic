#!/bin/bash

echo "=== Encephalic Port Cleanup Utility ==="
echo ""
echo "This script will forcefully clean up ports 80 and 8000"
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
pkill -9 -f "docker-proxy.*8000" 2>/dev/null || true
pkill -9 -f "docker-proxy.*80" 2>/dev/null || true
sleep 1

# Clean up ports
for port in 80 8000; do
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
sleep 5

# Function to check if port can be bound (more reliable than lsof)
check_port_available() {
    local port=$1
    # Try to bind to the port using Python (most reliable method)
    python3 -c "import socket; s = socket.socket(); s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1); s.bind(('0.0.0.0', $port)); s.close()" 2>/dev/null
    return $?
}

# Verify with retry logic
echo ""
echo "Verifying ports are now free..."
max_retries=3
retry_count=0
all_clear=true

while [ $retry_count -lt $max_retries ]; do
    all_clear=true

    for port in 80 8000; do
        if ! check_port_available $port; then
            if [ $retry_count -eq 0 ]; then
                echo "  Port $port is not yet available (may be in TIME_WAIT state)..."
            fi
            all_clear=false
        else
            if [ $retry_count -eq 0 ]; then
                echo "  ✓ Port $port is free"
            fi
        fi
    done

    # If all ports are available, break out of retry loop
    if [ "$all_clear" = true ]; then
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

echo ""
if [ "$all_clear" = true ]; then
    echo "✓ All ports are clear! You can now run ./start.sh"
else
    echo "⚠ Some ports are still in use after cleanup attempts."
    echo ""
    # Show detailed info for debugging
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
    echo "  3. Restart Docker to clear all port bindings"
    echo "  4. Reboot your system to force clear all socket states"
fi
