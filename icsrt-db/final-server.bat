@echo off
echo ================================================
echo    ICSRT Server - Fixed Contact Integration
echo ================================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo [1/4] Stopping all Node processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 3 >nul

echo [2/4] Clearing port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 >nul

echo [3/4] Verifying port is free...
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 still in use. Waiting...
    timeout /t 5 >nul
)

echo [4/4] Starting server with simplified contact endpoints...
echo.
echo ================================================
echo  Server Status - Watch for these messages:
echo  ✅ Connected to MongoDB Atlas
echo  📞 Contact API called at: [timestamp]
echo  📊 Found X contact requests
echo ================================================
echo.

node server.js

echo.
echo ================================================
echo Server stopped. Check the output above for any errors.
echo Press any key to exit.
pause >nul
