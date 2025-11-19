#!/bin/bash

echo "=== Encephalic Docker Logs Checker ==="
echo ""

echo "Backend Container Status:"
docker ps -a | grep encephalic-backend || echo "  Container not found"
echo ""

echo "Frontend Container Status:"
docker ps -a | grep encephalic-frontend || echo "  Container not found"
echo ""

echo "=== Backend Logs (last 50 lines) ==="
docker logs encephalic-backend --tail 50 2>&1 || echo "Cannot get backend logs"
echo ""

echo "=== Frontend Logs (last 50 lines) ==="
docker logs encephalic-frontend --tail 50 2>&1 || echo "Cannot get frontend logs"
echo ""

echo "=== Port Usage ==="
echo "Processes on port 3000:"
lsof -i:3000 2>/dev/null || echo "  Port 3000 is free"
echo ""
echo "Processes on port 5000:"
lsof -i:5000 2>/dev/null || echo "  Port 5000 is free"
