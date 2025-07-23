#!/bin/bash

echo "🚀 FREQ Backend Server Startup Script"
echo "======================================"

# Check if port 8081 is available
if lsof -i :8081 > /dev/null 2>&1; then
    echo "⚠️  Port 8081 is already in use. Stopping existing process..."
    lsof -ti :8081 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "🔧 Starting FREQ backend server..."
echo "📍 Server will be available at: http://localhost:8081"
echo "🔗 Health check: http://localhost:8081/health"
echo "📡 tRPC API: http://localhost:8081/api/trpc"
echo "🔐 Admin login: masterfreq / freq2007"
echo ""

# Start the server
bun run server.ts