@echo off
echo ============================================
echo    ICSRT Service Orders System Setup
echo ============================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo Step 1: Installing/updating dependencies...
npm install

echo.
echo Step 2: Creating test service orders...
node create-test-service-orders.js

echo.
echo Step 3: Starting the backend server...
echo ============================================
echo Backend will run on: http://localhost:3000
echo Dashboard runs on: http://localhost:3001  
echo User Page runs on: http://localhost:3002
echo ============================================
echo.
echo Keep this window open while using the application
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
