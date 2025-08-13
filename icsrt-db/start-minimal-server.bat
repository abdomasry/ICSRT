@echo off
echo ========================================
echo    ICSRT Minimal Tickets Server Starter
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
echo Starting ICSRT Minimal Tickets Server...
echo ========================================
echo This is a simplified server for testing the tickets system
echo It includes only the essential ticket endpoints
echo ========================================
echo.

node minimal-tickets-server.js

echo.
echo Server stopped.
pause
