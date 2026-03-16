@echo off
echo ====================================
echo    ICSRT Email Configuration Setup
echo ====================================
echo.
echo This script will help you configure email for ICSRT verification system.
echo.
echo IMPORTANT: You need to set up App Password for your email provider:
echo.
echo For Gmail:
echo 1. Enable 2-Factor Authentication in your Google Account
echo 2. Go to Security ^> 2-Step Verification ^> App passwords
echo 3. Generate an app password for "Mail"
echo 4. Use your Gmail address and the generated app password
echo.
echo For Yahoo:
echo 1. Enable 2-Factor Authentication in Yahoo Account Security
echo 2. Generate an app password for "Mail"
echo 3. Use your Yahoo address and the generated app password
echo.
echo ====================================
echo.
set /p EMAIL_ADDRESS="Enter your email address: "
set /p EMAIL_PASSWORD="Enter your app password: "
echo.
echo Setting environment variables...
setx EMAIL_USER "%EMAIL_ADDRESS%"
setx EMAIL_PASS "%EMAIL_PASSWORD%"
echo.
echo ✅ Email configuration saved!
echo.
echo IMPORTANT: 
echo 1. Restart your command prompt/PowerShell
echo 2. Restart the ICSRT server (node server.js)
echo 3. Email verification will now work properly
echo.
echo Press any key to continue...
pause >nul
