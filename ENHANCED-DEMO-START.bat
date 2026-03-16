@echo off
title ICSRT++ Enhanced Demo System
color 0A

echo.
echo  ===============================================================
echo                    ICSRT++ ENHANCED DEMO SYSTEM
echo              Complete Purchase Link System Demonstration
echo  ===============================================================
echo.

echo 🧹 Cleaning up any existing processes...
taskkill /F /IM node.exe 2>nul >nul
taskkill /F /IM "Code.exe" 2>nul >nul

echo ⏱️  Waiting for processes to close...
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Starting Enhanced Backend Server...
echo    - Auto-creating comprehensive test data
echo    - Generating purchase links automatically  
echo    - Setting up user accounts and service orders
echo.

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"
start "🔧 ICSRT Backend [Enhanced]" cmd /k "title ICSRT Backend Enhanced && echo 🔧 Starting ICSRT Backend with Enhanced Demo Data... && echo. && node server.js"

echo ⏱️  Waiting for backend initialization...
timeout /t 8 /nobreak >nul

echo.
echo 🎨 Starting Admin Dashboard...
cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-dashboard"
start "📊 ICSRT Dashboard [Admin]" cmd /k "title ICSRT Admin Dashboard && echo 📊 Starting Admin Dashboard... && echo. && npm start"

echo.
echo 🌐 Starting User Page...
cd /d "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-userpage" 
start "👤 ICSRT User Page" cmd /k "title ICSRT User Page && echo 👤 Starting User Page... && echo. && npm start"

echo.
echo ⏱️  Waiting for all services to initialize...
timeout /t 10 /nobreak >nul

echo.
echo  ===============================================================
echo                      🎯 SYSTEM READY FOR TESTING!
echo  ===============================================================
echo.
echo  📋 TEST SCENARIOS AVAILABLE:
echo.
echo  1️⃣  ADMIN DASHBOARD TESTING:
echo     URL: http://localhost:3001
echo     Login: admin@icsrt.com / admin123
echo     ✅ View service orders with "Pay Link" buttons
echo     ✅ Generate secure purchase links
echo     ✅ Copy and share payment URLs
echo.
echo  2️⃣  USER DASHBOARD TESTING:  
echo     URL: http://localhost:3002
echo     Login: testuser@icsrt.com / password123
echo     ✅ View orders with "Pay with Link" buttons
echo     ✅ See payment link status indicators
echo     ✅ Access direct payment options
echo.
echo  3️⃣  PURCHASE LINK TESTING:
echo     ✅ Purchase links auto-generated for confirmed orders
echo     ✅ Secure token-based authentication
echo     ✅ 72-hour expiry with countdown
echo     ✅ Coupon system integration
echo     ✅ Complete billing form
echo.
echo  4️⃣  AVAILABLE TEST DATA:
echo     👥 Users: testuser@icsrt.com, admin@icsrt.com, customer@icsrt.com
echo     🔑 Password: password123 (admin123 for admin)
echo     🎟️  Coupons: WELCOME10, SAVE50, BIGDEAL20, PREMIUM15
echo     📦 Service Orders: E-commerce ($2,500), Mobile App ($3,500)
echo     🔗 Purchase Links: Auto-generated and ready to test
echo.
echo  5️⃣  PURCHASE LINK FEATURES:
echo     🔐 Secure token authentication
echo     ⏰ Expiry countdown and validation
echo     🎟️  Real-time coupon validation
echo     💳 Complete billing information form
echo     📱 Mobile-responsive design
echo     🔒 SSL security indicators
echo.
echo  ===============================================================
echo.

echo 🚀 Opening test interfaces...
timeout /t 3 /nobreak >nul

start http://localhost:3001
timeout /t 2 /nobreak >nul
start http://localhost:3002

echo.
echo  ⭐ QUICK START GUIDE:
echo  ════════════════════
echo  1. Login to admin dashboard → View Service Orders → Click "Pay Link"
echo  2. Copy generated purchase URL → Open in new tab/incognito mode  
echo  3. Test complete purchase flow with coupon codes
echo  4. Login to user page → See "Pay with Link" buttons
echo  5. Experience seamless payment integration
echo.
echo  🎯 The complete purchase link system is now running!
echo     Both admin and user interfaces are active.
echo     All test data has been created automatically.
echo     Purchase links are generated and ready for testing.
echo.
echo  💡 TIP: Keep all terminal windows open to maintain services.
echo      Use Ctrl+C in any window to stop that service.
echo.
echo  🔥 ENJOY TESTING THE ENHANCED PURCHASE LINK SYSTEM! 🔥
echo.

pause
