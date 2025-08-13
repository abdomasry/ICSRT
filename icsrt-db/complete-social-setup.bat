@echo off
echo 🔧 ICSRT Social Media System Complete Setup
echo ==========================================
echo.

echo 1. Setting up database collection...
node setup-social-media-collection.js

echo.
echo 2. Starting database server...
start "ICSRT Database Server" cmd /k "echo Starting ICSRT Database Server && node server.js"

echo.
echo 3. Waiting for server to initialize...
timeout /t 8 /nobreak >nul

echo.
echo 4. Testing social media API...
node test-connection.js

echo.
echo 5. Server Status:
echo    Database: http://localhost:3000
echo    Social Media API: http://localhost:3000/api/social-links
echo.

echo 6. Testing endpoints with curl...
curl -s http://localhost:3000/api/social-links || echo Failed to connect

echo.
echo ✅ Setup Complete!
echo.
echo 🎯 Next Steps:
echo    1. Open dashboard: http://localhost:3001
echo    2. Navigate to "Social Media" in sidebar
echo    3. Manage your social media links
echo    4. Check user page footer: http://localhost:3002
echo.
pause
