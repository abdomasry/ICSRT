@echo off
title ICSRT Social Links Server - WORKING VERSION
color 0A

echo.
echo        =====================================================
echo                ICSRT Social Links Server 
echo                   FIXED - NO MONGOOSE
echo        =====================================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🎯 FIXING YOUR SOCIAL MEDIA ISSUE:
echo.
echo ❌ Previous Error: mongoose module not found
echo ✅ New Solution: Using native MongoDB driver (already installed)
echo.
echo 📊 Server Details:
echo    • Uses: mongodb package (already in your package.json)
echo    • API Endpoints: /api/social-links (with dash)
echo    • Database Collection: social_links (with underscore) 
echo    • Port: 3000
echo    • Database: icsrt_main on MongoDB Atlas
echo.
echo 🚀 Starting working server...
echo.

node simple-social-server.js

echo.
echo Press any key to close...
pause >nul
