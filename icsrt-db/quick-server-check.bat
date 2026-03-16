@echo off
echo 🔍 Checking ICSRT Server Status...
echo.

echo Testing if server is running on port 3000...
curl -s http://localhost:3000/api/health > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Server is running
    echo.
    echo Testing signup endpoint...
    curl -X POST -H "Content-Type: application/json" -d "{\"fullName\":\"Test\",\"email\":\"test@test.com\",\"password\":\"test123\"}" http://localhost:3000/api/auth/signup
) else (
    echo ❌ Server is NOT running on port 3000
    echo.
    echo 💡 To start server:
    echo    cd "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"
    echo    node server.js
)
echo.
pause
