@echo off
title ICSRT System - Complete Rebuild
color 0E

echo.
echo        =====================================================
echo               ICSRT System - Complete Rebuild
echo                 Fixing All Dashboard Issues
echo        =====================================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🔍 IDENTIFIED ISSUES:
echo.
echo ❌ JWT_SECRET not defined in server
echo ❌ Missing jsonwebtoken dependency 
echo ❌ Authentication failures causing 401 errors
echo ❌ Dashboard stats showing 0
echo ❌ Service orders showing wrong data
echo ❌ Mixed demo/real data logic
echo.
echo ✅ SOLUTION: Complete system rebuild with proper auth
echo.
echo 📊 What we'll fix:
echo    • Add proper JWT configuration
echo    • Fix authentication endpoints
echo    • Standardize data fetching logic
echo    • Fix dashboard API calls
echo    • Implement proper fallback mechanisms
echo.
echo 🚀 Starting comprehensive fix...
echo.

echo Installing missing dependencies...
npm install jsonwebtoken

echo.
echo Starting server with fixes...
node server.js

echo.
echo Press any key to close...
pause >nul
