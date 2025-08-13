@echo off
echo ================================================================
echo                    Testing ICSRT++ System
echo ================================================================

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🔍 Testing Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found or not working
    pause
    exit /b 1
)

echo.
echo 📦 Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm not found or not working
    pause
    exit /b 1
)

echo.
echo 🧪 Testing database connection...
node quick-db-test.js
if %errorlevel% neq 0 (
    echo ⚠️ Database test had issues, continuing anyway...
)

echo.
echo 🚀 Starting server on port 3000...
echo.
echo Server will be available at: http://localhost:3000
echo API endpoints:
echo   - GET  /api/user/service-orders?userEmail=testuser@icsrt.com
echo   - POST /api/user/service-orders/:id/messages
echo.
echo 📧 Test user email: testuser@icsrt.com
echo.
echo Press Ctrl+C to stop the server
echo ================================================================

npm start
