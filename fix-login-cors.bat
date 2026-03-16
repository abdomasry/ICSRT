@echo off
echo ================================================================
echo                  ICSRT++ Login Issue Fix
echo ================================================================

echo 🔧 Step 1: Checking ports and starting backend...
cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo Stopping any existing Node processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1

echo Starting backend server on port 3000...
start "ICSRT Backend" cmd /k "npm start"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Step 2: Starting userpage on correct port...
cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-userpage"

echo Stopping any existing Node processes on port 3002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do taskkill /f /pid %%a >nul 2>&1

echo Setting PORT environment variable to 3002...
set PORT=3002

echo Starting userpage on port 3002...
start "ICSRT Userpage" cmd /k "npm start"

echo.
echo ✅ Both services should now be running:
echo    - Backend API: http://localhost:3000
echo    - User Page: http://localhost:3002
echo.
echo 🧪 Test Login:
echo    1. Open http://localhost:3002/login
echo    2. Use these test credentials:
echo       Email: testuser@icsrt.com
echo       Password: password123
echo.
echo ⚠️  If login still fails, check:
echo    - Both windows are running without errors
echo    - No firewall blocking the ports
echo    - Browser allows cross-origin requests
echo.
echo Press any key to open the login page...
pause >nul
start http://localhost:3002/login

echo.
echo 🔍 If you still get CORS errors:
echo    1. Check browser console for exact error
echo    2. Verify ports in browser address bar
echo    3. Try refreshing both server windows
echo.
pause
