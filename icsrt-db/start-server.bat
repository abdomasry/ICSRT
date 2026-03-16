@echo off
echo ========================================
echo       ICSRT Backend Server Starter
echo ========================================
echo.

cd /d "%~dp0"

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version

echo.
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting ICSRT Backend Server...
echo ========================================
echo If you see "Server is running on http://localhost:3000"
echo then the server started successfully!
echo.
echo Keep this window open while using the admin dashboard
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

echo.
echo Server stopped.
pause
