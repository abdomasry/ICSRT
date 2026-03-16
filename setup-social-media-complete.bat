@echo off
title ICSRT Social Media System - Complete Setup and Test
color 0A

echo.
echo        ===============================================
echo                 ICSRT Social Media System
echo             Complete Setup and Test Tool
echo        ===============================================
echo.

echo 1. Testing and setting up social media API...
echo.

REM First run the test script to set up database
node test-social-api.js

echo.
echo 2. Checking if servers are running...
echo.

REM Check if database server is running
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Database Server (3000): Running
) else (
    echo    ❌ Database Server (3000): Not running
    echo       Starting database server...
    cd icsrt-db
    start "ICSRT Database" cmd /k "echo Starting ICSRT Database Server... && node server.js"
    cd ..
    timeout /t 3 >nul
)

REM Check if dashboard is running
curl -s http://localhost:3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Dashboard (3001): Running
) else (
    echo    ❌ Dashboard (3001): Not running
    echo       Starting dashboard...
    cd icsrt-dashboard
    start "ICSRT Dashboard" cmd /k "echo Starting ICSRT Dashboard... && npm start"
    cd ..
)

echo.
echo 3. Testing Social Media API endpoints...
echo.

timeout /t 2 >nul

curl -s http://localhost:3000/api/social-links
if %errorlevel% equ 0 (
    echo    ✅ Social Links API is responding!
) else (
    echo    ❌ Social Links API not responding
)

echo.
echo ===============================================
echo                    SUCCESS!
echo ===============================================
echo.
echo 📱 Social Media Management is now ready!
echo.
echo 🌐 Access Points:
echo    - Dashboard: http://localhost:3001
echo    - API Test: http://localhost:3000/api/social-links
echo.
echo 📋 Next Steps:
echo    1. Open the dashboard: http://localhost:3001
echo    2. Navigate to "Social Media" in the sidebar  
echo    3. Add/edit your social media links
echo.
echo Press any key to open the dashboard...
pause >nul

start http://localhost:3001

echo.
echo 🎉 Setup complete! You can now manage social media links.
echo.
pause
