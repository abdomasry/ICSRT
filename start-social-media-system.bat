@echo off
echo 🔗 ICSRT Social Media Management System Setup
echo =============================================
echo.

echo 📋 Checking system files...
node verify-social-media-system.js

echo.
echo 🚀 Starting system components...
echo.

echo 1. Starting Database Server...
start "ICSRT Database Server" cmd /k "cd icsrt-db && node server.js"

echo 2. Waiting for database to initialize...
timeout /t 5 /nobreak >nul

echo 3. Creating default social media links...
cd icsrt-db
node setup-default-social-links.js
cd ..

echo 4. Starting Dashboard (Port 3001)...
start "ICSRT Dashboard" cmd /k "cd icsrt-dashboard && npm start"

echo 5. Starting User Page (Port 3002)...
start "ICSRT User Page" cmd /k "cd icsrt-userpage && npm start"

echo.
echo ✅ Setup Complete!
echo.
echo 🌐 Access URLs:
echo    Dashboard: http://localhost:3001
echo    User Page: http://localhost:3002
echo    API: http://localhost:3000
echo.
echo 📋 To manage social media links:
echo    1. Open dashboard and login
echo    2. Click "Social Media" in sidebar
echo    3. Add/edit your social media links
echo    4. Check user page footer to see links
echo.
pause
