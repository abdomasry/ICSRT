@echo off
echo =========================================
echo       ICSRT Email Configuration
echo =========================================
echo.
echo This will help you set up email verification
echo for your ICSRT project using Gmail.
echo.
echo Prerequisites:
echo - Gmail account
echo - 2-Factor Authentication enabled
echo - Gmail App Password generated
echo.
pause
echo.
echo Starting Email Configuration Wizard...
node setup-email-wizard.js
echo.
echo Press any key to exit...
pause >nul
