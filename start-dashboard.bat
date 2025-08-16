@echo off
echo 🎨 Starting ICSRT Dashboard...
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-dashboard"

echo 📱 Starting React Dashboard...
echo Dashboard will be available at: http://localhost:3001
echo.
echo Social Media Management: http://localhost:3001/social-media
echo.
echo Press Ctrl+C to stop the dashboard
echo.

rem Force React dev server to use port 3001 to avoid backend conflict
set PORT=3001
npm start

pause
