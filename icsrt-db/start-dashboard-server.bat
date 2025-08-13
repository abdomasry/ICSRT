@echo off
title ICSRT Dashboard Server - Testing Auth
color 0B

echo.
echo        =====================================================
echo               ICSRT Dashboard Server Testing
echo                  Fixing Authentication Issues
echo        =====================================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🔍 DIAGNOSING DASHBOARD ISSUES:
echo.
echo ❌ Current Problem: All stats showing 0, wrong service data
echo ✅ Solution: Start server and test API endpoints
echo.
echo 📊 Server Details:
echo    • Port: 3000
echo    • Database: icsrt_main on MongoDB Atlas
echo    • API Endpoints: /api/user/stats, /api/user/tickets, /api/user/service-orders
echo    • Authentication: JWT tokens + email fallback
echo.
echo 🚀 Starting server with debug logs...
echo.

node server.js

echo.
echo Press any key to close...
pause >nul
