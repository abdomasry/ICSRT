#!/bin/bash

echo "🔧 ICSRT++ Quick Start Script"
echo "=============================="

echo "🔍 Checking for existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "No process on port 3002"

echo ""
echo "🚀 Starting backend server..."
cd "d:/Abdo/WORK/Real Projects/ICSRT++/icsrt-db"
node server.js &
BACKEND_PID=$!

echo "⏱️  Waiting for backend to initialize..."
sleep 3

echo ""
echo "🌐 Starting userpage..."
cd "d:/Abdo/WORK/Real Projects/ICSRT++/icsrt-userpage"
PORT=3002 npm start &
USERPAGE_PID=$!

echo ""
echo "✅ Services started:"
echo "   - Backend (PID: $BACKEND_PID): http://localhost:3000"
echo "   - Userpage (PID: $USERPAGE_PID): http://localhost:3002"
echo ""
echo "🧪 Test login at: http://localhost:3002/login"
echo "   Email: testuser@icsrt.com"
echo "   Password: password123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $USERPAGE_PID; exit" INT
wait
