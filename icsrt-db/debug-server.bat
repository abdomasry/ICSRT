@echo off
echo ================================
echo    ICSRT Contact Server Debug
echo ================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo Killing any existing Node processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Checking port 3000...
netstat -ano | findstr :3000

echo.
echo Starting server...
echo Press Ctrl+C to stop the server
echo.

node server.js

echo.
echo Server stopped.
pause
