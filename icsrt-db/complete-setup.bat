@echo off
title Complete ICSRT Social Links Setup
echo.
echo ================================================
echo        Complete ICSRT Social Links Setup
echo ================================================
echo.
echo This will:
echo 1. Kill any running Node.js processes
echo 2. Start the main server with social links API
echo 3. Test the API endpoints
echo 4. Open the test console
echo.
pause
echo.

echo Step 1: Stopping any running servers...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Starting main server...
start "ICSRT Server" cmd /c "node server.js & pause"
timeout /t 5

echo Step 3: Testing API...
node test-api-quick.js

echo.
echo ================================================
echo Setup complete! 
echo.
echo - Server running on: http://localhost:3000
echo - Dashboard: Start with start-dashboard.bat  
echo - Test API: http://localhost:3000/api/social-links
echo ================================================
pause
