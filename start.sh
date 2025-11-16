#!/bin/bash

# Encephalic - EEG Visualization Platform
# Startup Script

echo "=========================================="
echo "  Encephalic - EEG Visualization Platform"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker."
    exit 1
fi

echo "✅ Docker daemon is running"
echo ""

# Build and start containers
echo "🚀 Building and starting containers..."
echo "   This may take a few minutes on first run..."
echo ""

docker-compose up --build -d

# Check if containers started successfully
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Application started successfully!"
    echo "=========================================="
    echo ""
    echo "📱 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo ""
    echo "📊 View logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 Stop the application:"
    echo "   docker-compose down"
    echo ""
    echo "Happy analyzing! 🧠"
else
    echo ""
    echo "❌ Failed to start containers"
    echo "   Run 'docker-compose logs' to see error details"
    exit 1
fi
