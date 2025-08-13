@echo off
title ICSRT Main Server with Working Social Links
color 0A

echo.
echo        =====================================================
echo            ICSRT Main Server + Working Social Links
echo                     INTEGRATED SOLUTION
echo        =====================================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🎯 STARTING INTEGRATED SOLUTION:
echo.
echo ✅ Features:
echo    • Your complete ICSRT server with ALL features
echo    • Working social links API (local storage)
echo    • No separate servers needed
echo    • Dashboard social media management works
echo.
echo 📊 Technical Details:
echo    • Social links use local JSON storage
echo    • All other features use MongoDB as before
echo    • API endpoints: /api/social-links (working)
echo    • Port: 3000 (same as before)
echo.
echo 🚀 Starting integrated server...
echo.

node server.js

echo.
echo Press any key to close...
pause >nul
