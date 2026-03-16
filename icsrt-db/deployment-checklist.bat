@echo off
REM Production Deployment Checklist for ICSRT (Windows)
REM Run this before deploying to production

echo ==========================================
echo ICSRT Production Deployment Checklist
echo ==========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [X] .env file not found!
    echo    Creating .env from template...
    if exist .env.example (
        copy .env.example .env
    ) else (
        echo. > .env
    )
)

echo Checking environment variables...
echo.

REM Check EMAIL_USER
findstr /B "EMAIL_USER=" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=2 delims==" %%a in ('findstr /B "EMAIL_USER=" .env') do set EMAIL_USER=%%a
    if "!EMAIL_USER!"=="" (
        echo [X] EMAIL_USER - Not configured
        set all_good=false
    ) else if "!EMAIL_USER!"=="your-email@gmail.com" (
        echo [X] EMAIL_USER - Using placeholder value
        set all_good=false
    ) else (
        echo [OK] EMAIL_USER - Configured
    )
) else (
    echo [X] EMAIL_USER - Not found in .env
    set all_good=false
)

REM Check EMAIL_PASS
findstr /B "EMAIL_PASS=" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=2 delims==" %%a in ('findstr /B "EMAIL_PASS=" .env') do set EMAIL_PASS=%%a
    if "!EMAIL_PASS!"=="" (
        echo [X] EMAIL_PASS - Not configured
        set all_good=false
    ) else if "!EMAIL_PASS!"=="your-app-password-here" (
        echo [X] EMAIL_PASS - Using placeholder value
        set all_good=false
    ) else (
        echo [OK] EMAIL_PASS - Configured
    )
) else (
    echo [X] EMAIL_PASS - Not found in .env
    set all_good=false
)

echo.
echo ==========================================
echo.
echo To configure email:
echo 1. Run: node setup-email.js
echo 2. Or manually edit .env file
echo 3. Then upload .env to production server
echo.
echo Production deployment steps:
echo 1. Upload entire icsrt-db folder to server
echo 2. Make sure .env file is included
echo 3. SSH into server and run: npm install
echo 4. Start server: node server.js
echo 5. Verify: node test-email.js
echo.
echo ==========================================
pause
