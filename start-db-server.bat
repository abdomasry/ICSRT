@echo off
echo 🚀 Starting ICSRT Database Server...
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo Starting server on port 3000...
start "ICSRT DB Server" cmd /k "node server.js"

echo Waiting for server to initialize...
timeout /t 5 /nobreak >nul

echo Testing connection...
node test-connection.js

echo.
echo ✅ Server should be running now!
echo Access social media management at: http://localhost:3001
echo (Navigate to Social Media in the dashboard sidebar)
echo.
pause
