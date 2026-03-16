@echo off
echo Starting ICSRT Database Server with Debug Info...
echo.
echo Checking if Node.js is available...
node --version
echo.
echo Current directory: %CD%
echo Target directory: d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db
echo.
echo Starting server on port 3000...
echo Press Ctrl+C to stop the server
echo.
cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"
echo Changed to: %CD%
echo.
echo Running: node server.js
node server.js
echo.
echo Server stopped. Press any key to close...
pause
