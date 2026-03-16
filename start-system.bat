@echo off
echo ================================================================
echo                ICSRT++ Complete System Startup
echo ================================================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🔧 Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo 📊 Creating test user and service orders...
node create-test-user-orders.js
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Could not create test data, but continuing...
)

echo.
echo 🚀 Starting backend server on port 3000...
echo Backend will be available at: http://localhost:3000
echo.
echo 📋 API Endpoints:
echo    - GET  /api/user/service-orders
echo    - POST /api/user/service-orders/:id/messages
echo    - GET  /api/users (admin)
echo.
echo 🧪 Test user credentials:
echo    Email: testuser@icsrt.com
echo.
echo ⏳ Server starting... (Press Ctrl+C to stop)
echo ================================================================

start "ICSRT Backend Server" cmd /k "npm start"

echo.
echo 🌐 To start the frontend:
echo    1. Open new terminal
echo    2. cd icsrt-userpage
echo    3. npm install
echo    4. npm start
echo.
echo Frontend will be available at: http://localhost:3002
echo.
pause
