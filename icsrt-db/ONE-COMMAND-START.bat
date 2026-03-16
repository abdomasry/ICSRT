@echo off
echo ========================================
echo   ICSRT++ Auto-Start System
echo ========================================
echo.
echo 🚀 Starting complete ICSRT++ system...
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🔧 Killing any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo 📦 Starting backend server with auto-frontend launch...
echo.
echo ⏳ This will automatically:
echo    ✅ Start backend API (port 3000)
echo    ✅ Create test data and purchase links
echo    ✅ Launch dashboard (port 3001)
echo    ✅ Launch user page (port 3002)
echo    ✅ Open both in browser
echo.
echo 🎯 Just wait for "System is fully ready!" message
echo.

node server.js

pause
