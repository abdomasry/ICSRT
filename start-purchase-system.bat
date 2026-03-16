@echo off
echo ================================================================
echo           ICSRT++ Service Purchase System Startup
echo ================================================================
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

echo 🔧 Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo 📊 Creating purchase system test data...
echo This includes:
echo - Service orders ready for purchase
echo - Sample coupon codes
echo - Payment system setup
echo.
node create-purchase-test-data.js
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Could not create purchase test data, but continuing...
)

echo.
echo 🚀 Starting backend server on port 3000...
echo.
echo 📋 Available APIs:
echo    - GET  /api/user/service-orders (with purchase-ready orders)
echo    - POST /api/user/service-orders/:id/purchase
echo    - POST /api/user/coupons/validate
echo    - GET  /api/user/payments
echo    - POST /api/webhooks/payment/paymob
echo.
echo 🧪 Test user credentials:
echo    Email: testuser@icsrt.com
echo.
echo 🎫 Test coupon codes:
echo    - WELCOME10 (10%% off)
echo    - SAVE50 ($50 off orders above $200)
echo    - EARLY20 (20%% off)
echo.
echo 💳 Payment Features Ready:
echo    - Service order purchasing
echo    - Coupon code validation
echo    - Billing information collection
echo    - Payment status tracking
echo    - Ready for Paymob API integration
echo.
echo ⏳ Server starting... (Press Ctrl+C to stop)
echo ================================================================

start "ICSRT Backend Server" cmd /k "npm start"

echo.
echo 🌐 To start the frontend with purchase features:
echo    1. Open new terminal
echo    2. cd icsrt-userpage
echo    3. npm install
echo    4. npm start
echo.
echo Frontend will be available at: http://localhost:3002
echo.
echo 🛒 Purchase Flow Test:
echo    1. Login with testuser@icsrt.com
echo    2. Go to Service Orders
echo    3. Look for orders with "Ready for payment" status
echo    4. Click "Purchase Now" button
echo    5. Apply coupon codes and complete purchase
echo.
pause
