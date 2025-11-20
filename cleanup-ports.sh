#!/bin/bash

echo "Cleaning up Encephalic containers..."
echo ""

# Stop and remove containers
echo "Stopping containers..."
docker-compose down -v 2>/dev/null || true

echo "Removing specific containers..."
docker stop encephalic-frontend encephalic-backend 2>/dev/null || true
docker rm -f encephalic-frontend encephalic-backend 2>/dev/null || true

echo "Removing network..."
docker network rm encephalic-network 2>/dev/null || true

echo ""
echo "Cleanup complete!"
echo "You can now run ./start.sh to start fresh."
echo ""
