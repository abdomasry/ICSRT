@echo off
echo 🚀 Starting ICSRT Server...
echo ============================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo Current directory: %CD%
echo.

echo Checking if server.js exists...
if exist server.js (
    echo ✅ server.js found
) else (
    echo ❌ server.js not found in current directory
    dir /b *.js
    pause
    exit
)

echo.
echo Starting server...
echo.

node server.js

echo.
echo Server stopped. Press any key to continue...
pause
