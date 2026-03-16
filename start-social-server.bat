@echo off
title ICSRT Social Media Server
color 0A

echo.
echo        ===============================================
echo                ICSRT Social Media Server
echo             Starting Social Links API...
echo        ===============================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🚀 Starting Social Media Server...
echo.
echo 📱 This will enable social links management in your dashboard
echo 🌐 API will be available at: http://localhost:3000/api/social-links
echo.

node social-media-server.js

pause
