#!/bin/bash

# TransferMe Development Setup Script
# Starts both frontend and backend services

set -e

FRONTEND_DIR="/Users/desireetorres/frontend/TransferMe"
BACKEND_DIR="/Users/desireetorres/Desktop/backend"

echo "🚀 TransferMe Development Environment Setup"
echo "==========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if services are already running
echo "Checking for running services..."
if lsof -i :8080 > /dev/null 2>&1; then
    print_warning "Backend service already running on port 8080"
    BACKEND_RUNNING=true
else
    BACKEND_RUNNING=false
fi

# Start Backend
if [ "$BACKEND_RUNNING" = false ]; then
    echo ""
    echo "Starting Backend (Spring Boot)..."
    cd "$BACKEND_DIR"
    nohup bash ./gradlew bootRun -DskipTests > backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > .backend.pid
    print_status "Backend started (PID: $BACKEND_PID)"
    echo "Waiting for backend to initialize (10 seconds)..."
    sleep 10
else
    print_status "Backend already running"
fi

# Verify backend is responsive
echo ""
echo "Verifying backend connectivity..."
if curl -s http://localhost:8080/api/institutions > /dev/null 2>&1; then
    print_status "Backend is responsive"
else
    print_warning "Backend not responding yet, you may need to wait a moment"
fi

# Start Frontend
echo ""
echo "Starting Frontend (Expo)..."
cd "$FRONTEND_DIR"
print_status "Frontend dependencies ready"
print_status "To start the frontend, run: npx expo start"

echo ""
echo "==========================================="
echo "🎉 Setup Complete!"
echo ""
echo "Environment Summary:"
echo "  Backend:  http://localhost:8080/api"
echo "  Frontend: Ready to start with 'npx expo start'"
echo ""
echo "Next Steps:"
echo "  1. In a new terminal, cd $FRONTEND_DIR"
echo "  2. Run: npx expo start"
echo "  3. Press 'w' for web, 'i' for iOS, or 'a' for Android"
echo ""
echo "To stop services:"
echo "  Backend:  kill $(cat $BACKEND_DIR/.backend.pid 2>/dev/null || echo 'check ps aux | grep gradlew')"
echo "  Frontend: Press Ctrl+C in the expo terminal"
echo "==========================================="
