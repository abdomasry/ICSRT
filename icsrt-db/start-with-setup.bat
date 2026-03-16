@echo off
echo.
echo ================================
echo   ICSRT Backend Server Starter
echo ================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 📁 Current directory: %CD%
echo.

echo 🔍 Setting up database with test data...
node quick-setup.js

echo.
echo 🚀 Starting ICSRT Backend Server...
echo 📊 Admin Service Orders API will be available at:
echo    http://localhost:3000/api/admin/service-orders
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

node server.js

pause
