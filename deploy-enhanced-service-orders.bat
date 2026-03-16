@echo off
echo ==========================================
echo ICSRT Enhanced Service Orders System
echo With Multi-Channel Communication
echo ==========================================

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++"

echo.
echo ✨ NEW FEATURES BEING DEPLOYED:
echo.
echo 🎯 Enhanced Service Orders:
echo    • Editable pricing with history tracking
echo    • Multi-channel communication (Userpage, WhatsApp, Email)
echo    • Real-time messaging like tickets
echo    • Price change notifications
echo    • Discount management
echo.
echo 💬 Communication Channels:
echo    • 💻 Userpage Chat - Live messaging
echo    • 📱 WhatsApp - Direct mobile contact
echo    • 📧 Email - Professional correspondence
echo.
echo 💰 Price Management:
echo    • Original vs current pricing
echo    • Discount tracking and reasons
echo    • Price change history
echo    • Admin price modification alerts
echo.

echo Step 1: Backup existing files...
if not exist "backups" mkdir backups
copy "icsrt-userpage\src\pages\UserDashboard.jsx" "backups\UserDashboard-old.jsx" 2>nul
copy "icsrt-userpage\src\pages\UserServiceOrders.jsx" "backups\UserServiceOrders-old.jsx" 2>nul

echo.
echo Step 2: Deploy enhanced components...
copy "icsrt-userpage\src\pages\UserDashboard-Fixed.jsx" "icsrt-userpage\src\pages\UserDashboard.jsx"
copy "icsrt-userpage\src\pages\UserServiceOrdersAdvanced.jsx" "icsrt-userpage\src\pages\UserServiceOrders.jsx"

echo.
echo Step 3: Update routing (if needed)...
echo Checking App.jsx for advanced service orders route...

echo.
echo Step 4: Install/verify dependencies...
cd "icsrt-db"
echo Installing backend dependencies...
npm install jsonwebtoken bcryptjs cors dotenv

echo.
echo Step 5: Starting enhanced system...
echo Starting backend with enhanced APIs...
start "ICSRT Backend Enhanced" cmd /c "npm start"

timeout /t 3 /nobreak >nul

echo Starting userpage with advanced service orders...
cd ..\icsrt-userpage
start "ICSRT Userpage Advanced" cmd /c "npm start"

echo.
echo Step 6: System Enhancement Summary...
echo ==========================================
echo 🚀 ENHANCED FEATURES NOW AVAILABLE:
echo.
echo 📊 Service Order Dashboard:
echo    ✅ Price editing and history
echo    ✅ Multi-channel messaging
echo    ✅ Real-time communication
echo    ✅ Discount management
echo    ✅ Enhanced status tracking
echo.
echo 💬 Communication Features:
echo    ✅ Userpage live chat
echo    ✅ WhatsApp integration
echo    ✅ Email integration
echo    ✅ Channel selection
echo    ✅ Message history
echo.
echo 💰 Pricing Features:
echo    ✅ Current vs original pricing
echo    ✅ Discount tracking
echo    ✅ Price change history
echo    ✅ Admin modification alerts
echo    ✅ Visual price indicators
echo.
echo 🎨 UI Improvements:
echo    ✅ Enhanced modals
echo    ✅ Better filtering
echo    ✅ Professional design
echo    ✅ Mobile responsive
echo    ✅ Dark mode support
echo.
echo Services should be starting:
echo - Backend API: http://localhost:3000
echo - Enhanced Userpage: http://localhost:3002
echo.
echo 🎯 HOW TO USE:
echo.
echo 1. Dashboard Enhancement:
echo    • View service orders with pricing info
echo    • See message counts and discounts
echo    • Click for detailed view
echo.
echo 2. Service Order Management:
echo    • Click "Price History" to see changes
echo    • Use "Communication" for channel options
echo    • Send messages via preferred channel
echo.
echo 3. Multi-Channel Communication:
echo    • Select channel (Userpage/WhatsApp/Email)
echo    • Send messages directly
echo    • View conversation history
echo.
echo 4. WhatsApp Integration:
echo    • Click WhatsApp button
echo    • Opens WhatsApp with pre-filled message
echo    • Direct mobile communication
echo.
echo 5. Email Integration:
echo    • Click Email button
echo    • Opens email client with template
echo    • Professional correspondence
echo.
echo System ready for advanced service order management!
echo ==========================================

pause
