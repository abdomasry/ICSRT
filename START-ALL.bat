@echo off
title ICSRT Project Launcher
echo ===================================================
echo              Starting ICSRT System (Next.js)
echo ===================================================
echo.

set ROOT_DIR=%~dp0

echo 1. Starting API Backend Server (Port 3000)...
start "ICSRT Backend API" cmd /k "cd /d "%ROOT_DIR%icsrt-db" && npm start"

timeout /t 3 /nobreak >nul

echo 2. Starting Admin Dashboard Next.js (Port 3001)...
start "ICSRT Admin Dashboard" cmd /k "cd /d "%ROOT_DIR%icsrt-dashboard" && npm run dev"

timeout /t 3 /nobreak >nul

echo 3. Starting User Portal Next.js (Port 3002)...
start "ICSRT User Portal" cmd /k "cd /d "%ROOT_DIR%icsrt-userpage" && npm run dev"

echo.
echo ===================================================
echo All ICSRT Next.js services are starting!
echo.
echo Access URLs:
echo - Backend API:     http://localhost:3000
echo - Admin Dashboard: http://localhost:3001
echo - User Web Portal: http://localhost:3002
echo ===================================================
echo.
pause
