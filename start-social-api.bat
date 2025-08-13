@echo off
title ICSRT Social Links API Server
color 0A

echo.
echo        =====================================================
echo                ICSRT Social Links API Server
echo               Fixing Endpoint Connection Issues
echo        =====================================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🎯 FIXING YOUR SOCIAL MEDIA ISSUE:
echo.
echo ❌ Problem: Dashboard shows "Endpoint not found" 
echo ✅ Solution: Starting dedicated social links server
echo.
echo 📊 Server Details:
echo    • API Endpoints: /api/social-links (with dash)
echo    • Database Collection: social_links (with underscore) 
echo    • Port: 3000
echo    • Database: icsrt_main on MongoDB Atlas
echo.
echo 🚀 Starting server...
echo.

node social-links-server.js

echo.
echo Press any key to close...
pause >nul
