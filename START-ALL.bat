@echo off
echo ====================================
echo Starting ICSRT Project Components
echo ====================================

echo.
echo Starting API Server (Port 3000)...
start "ICSRT API Server" cmd /k "cd /d d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db && node server.js"

timeout /t 3 /nobreak >nul

echo.
echo Starting Dashboard (Port 3001)...
start "ICSRT Dashboard" cmd /k "cd /d d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-dashboard && npm start"

timeout /t 3 /nobreak >nul

echo.
echo Starting User Page (Port 3002)...
start "ICSRT User Page" cmd /k "cd /d d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-userpage && set PORT=3002 && npm start"

echo.
echo ====================================
echo All components are starting...
echo.
echo Wait a few moments then access:
echo - Dashboard: http://localhost:3001
echo - User Page: http://localhost:3002
echo - API: http://localhost:3000
echo ====================================

pause
