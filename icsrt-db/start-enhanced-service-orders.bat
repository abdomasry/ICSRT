@echo off
echo ========================================
echo Enhanced Service Orders Setup & Start
echo ========================================
echo.

echo 1. Creating sample service orders data...
node create-sample-service-orders.js

echo.
echo 2. Starting enhanced backend server...
echo.
echo Server will run on http://localhost:3000
echo Enhanced Service Orders API endpoints:
echo   - GET  /api/admin/service-orders/enhanced
echo   - POST /api/admin/service-orders/:id/messages  
echo   - PUT  /api/admin/service-orders/:id/status
echo   - PUT  /api/admin/service-orders/:id/price/enhanced
echo   - GET  /api/admin/service-orders/:id/conversation
echo.

node server.js

pause
