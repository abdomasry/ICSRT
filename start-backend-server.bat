@echo off
echo 🚀 Starting ICSRT Social Media Management System...
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 📡 Starting Backend Server...
echo Server will be available at: http://localhost:3000
echo Dashboard will be available at: http://localhost:3001
echo.
echo Social Media Management: http://localhost:3001/social-media
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
