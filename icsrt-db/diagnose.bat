@echo off
echo ========================================
echo       ICSRT System Diagnostic
echo ========================================
echo.

echo 1. Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js is NOT installed
    echo Please install from: https://nodejs.org/
) else (
    echo ✅ Node.js is installed
)
echo.

echo 2. Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm is NOT available
) else (
    echo ✅ npm is available
)
echo.

echo 3. Checking current directory...
echo Current directory: %CD%
echo.

echo 4. Checking if server.js exists...
if exist "server.js" (
    echo ✅ server.js found
) else (
    echo ❌ server.js NOT found
)
echo.

echo 5. Checking package.json...
if exist "package.json" (
    echo ✅ package.json found
    echo Package content:
    type package.json | findstr /C:"name" /C:"main" /C:"express"
) else (
    echo ❌ package.json NOT found
)
echo.

echo 6. Checking node_modules...
if exist "node_modules" (
    echo ✅ node_modules directory exists
) else (
    echo ⚠️ node_modules directory missing
    echo Run 'npm install' to install dependencies
)
echo.

echo 7. Testing basic Node.js functionality...
echo console.log("Node.js is working!"); > test.js
node test.js
if %errorlevel% neq 0 (
    echo ❌ Node.js execution failed
) else (
    echo ✅ Node.js execution successful
)
del test.js >nul 2>&1
echo.

echo 8. Checking port 3000 availability...
netstat -an | findstr ":3000 "
if %errorlevel% equ 0 (
    echo ⚠️ Port 3000 is already in use
) else (
    echo ✅ Port 3000 is available
)
echo.

echo ========================================
echo Diagnosis complete!
echo ========================================
pause
