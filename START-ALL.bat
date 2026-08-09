@echo off
title ICSRT Project Launcher
echo ===================================================
echo              Starting ICSRT System
echo ===================================================
echo.

set ROOT_DIR=%~dp0

echo 1. Starting API Backend Server (Port 3000)...
start "ICSRT Backend API" cmd /k "cd /d "%ROOT_DIR%icsrt-db" && npm start"

timeout /t 3 /nobreak >nul

echo 2. Starting Admin Dashboard (Port 3001)...
start "ICSRT Admin Dashboard" cmd /k "cd /d "%ROOT_DIR%icsrt-dashboard" && npm start"

timeout /t 3 /nobreak >nul

echo 3. Starting User Portal (Port 3002)...
start "ICSRT User Portal" cmd /k "cd /d "%ROOT_DIR%icsrt-userpage" && set PORT=3002 && npm start"

echo.
echo ===================================================
echo All ICSRT services are starting!
echo.
echo Access URLs:
echo - Backend API:     http://localhost:3000
echo - Admin Dashboard: http://localhost:3001
echo - User Web Portal: http://localhost:3002
echo ===================================================
echo.
pause
