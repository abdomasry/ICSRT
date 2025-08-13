@echo off
setlocal enabledelayedexpansion

echo 🔧 ICSRT++ Quick Start Script
echo ==============================

echo 🔍 Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process on port 3000: %%a
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    echo Killing process on port 3002: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo 🚀 Starting backend server...
cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"
start "ICSRT Backend" cmd /k "echo Starting ICSRT Backend Server... && node server.js"

echo ⏱️  Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting userpage...
cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-userpage"
start "ICSRT Userpage" cmd /k "echo Starting ICSRT Userpage on Port 3002... && set PORT=3002 && npm start"

echo.
echo ✅ Services should be starting in separate windows:
echo    - Backend: http://localhost:3000
echo    - Userpage: http://localhost:3002
echo.
echo 🧪 Test login at: http://localhost:3002/login
echo    Email: testuser@icsrt.com
echo    Password: password123
echo.
echo ⏰ Waiting 10 seconds then opening login page...
timeout /t 10 /nobreak >nul

start http://localhost:3002/login

echo.
echo 🎯 If login works, test the purchase system:
echo    1. Go to Service Orders
echo    2. Click "Purchase" tab  
echo    3. Use coupon: WELCOME10
echo    4. Test the full purchase flow
echo.
echo Press any key to exit...
pause >nul
