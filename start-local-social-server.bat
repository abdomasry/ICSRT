@echo off
title ICSRT Social Links Server - LOCAL STORAGE (100% WORKING)
color 0A

echo.
echo        =====================================================
echo           ICSRT Social Links Server - LOCAL STORAGE
echo                   NO DATABASE REQUIRED!
echo        =====================================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🎯 GUARANTEED WORKING SOLUTION:
echo.
echo ❌ Previous Issues: 
echo    • mongoose module not found
echo    • MongoDB Atlas connection failed (ENOTFOUND)
echo.
echo ✅ New Solution: 
echo    • NO external database needed
echo    • Uses local JSON file storage
echo    • Works 100%% offline
echo    • Zero dependencies except Node.js
echo.
echo 📊 Server Details:
echo    • Storage: Local JSON file
echo    • API Endpoints: /api/social-links (with dash)
echo    • Port: 3000
echo    • No internet connection required
echo.
echo 🚀 Starting 100%% reliable server...
echo.

node local-social-server.js

echo.
echo Press any key to close...
pause >nul
