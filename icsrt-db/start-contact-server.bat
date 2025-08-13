@echo off
echo Starting Contact Server...
echo.
cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

REM Kill any existing Node processes
taskkill /f /im node.exe >nul 2>&1

echo Starting server on port 3000...
echo.
node contact-server.js

pause
