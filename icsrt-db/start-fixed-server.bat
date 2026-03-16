@echo off
echo ========================================
echo    ICSRT Social Media API Server
echo ========================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Starting ICSRT Backend Server...
echo.

cd /d "%~dp0"
node server.js

echo.
echo Server stopped.
pause
