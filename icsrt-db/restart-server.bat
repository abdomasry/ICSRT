@echo off
echo ========================================
echo    ICSRT Server with Enhanced Debugging
echo ========================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo [1/3] Stopping any existing Node processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/3] Checking if port 3000 is free...
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo Port 3000 is still in use, waiting...
    timeout /t 3 >nul
)

echo [3/3] Starting server with enhanced debugging...
echo.
echo ==========================================
echo Server output below:
echo ==========================================
echo.

node server.js

echo.
echo ==========================================
echo Server stopped. Press any key to exit.
pause >nul
