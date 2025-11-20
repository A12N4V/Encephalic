#!/bin/bash
# Script to rebuild and restart Docker containers

echo "Stopping existing containers..."
docker-compose down

echo "Rebuilding containers..."
docker-compose build --no-cache

echo "Starting containers..."
docker-compose up -d

echo "Following logs..."
docker-compose logs -f
