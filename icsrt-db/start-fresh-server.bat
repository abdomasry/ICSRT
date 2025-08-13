@echo off
echo 🛑 Stopping any running processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo 🚀 Starting ICSRT Backend Server...
cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 📦 Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo 🔄 Starting server on port 3000...
node server.js

pause
