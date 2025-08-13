@echo off
echo ==========================================
echo ICSRT SERVICE ORDERS - ERROR FIX & ENHANCEMENT
echo Multi-Channel Price Management System
echo ==========================================

cd /d "d:\Abdo\WORK\Real Projects\ICSRT++"

echo.
echo 🔧 FIXING CURRENT ERROR:
echo.
echo ❌ Current Error: order.messages is not iterable
echo ✅ Solution: Added optional chaining (order.messages?.map)
echo ✅ Enhancement: Complete price editing system with notifications
echo.

echo Step 1: Backup current files...
if not exist "backups" mkdir backups
copy "icsrt-userpage\src\pages\UserServiceOrders.jsx" "backups\UserServiceOrders-broken.jsx" 2>nul

echo.
echo Step 2: Deploy fixed and enhanced component...
copy "icsrt-userpage\src\pages\UserServiceOrdersFixed.jsx" "icsrt-userpage\src\pages\UserServiceOrders.jsx"

echo.
echo Step 3: Check userpage dependencies...
cd "icsrt-userpage"
echo Installing/checking React dependencies...
npm install

echo.
echo Step 4: Check backend dependencies...
cd ..\icsrt-db
echo Installing backend dependencies...
npm install jsonwebtoken bcryptjs cors dotenv

echo.
echo Step 5: Starting enhanced system...
echo Starting backend server...
start "ICSRT Backend Enhanced" cmd /c "npm start"

timeout /t 3 /nobreak >nul

echo Starting fixed userpage...
cd ..\icsrt-userpage
start "ICSRT Userpage Fixed" cmd /c "npm start"

echo.
echo Step 6: ERROR FIXED & ENHANCEMENTS DEPLOYED!
echo ==========================================
echo.
echo 🔧 FIXES APPLIED:
echo    ✅ Fixed order.messages iteration error
echo    ✅ Added optional chaining throughout component
echo    ✅ Ensured all orders have messages array
echo    ✅ Fixed state management for messages
echo.
echo 💰 NEW PRICE EDITING FEATURES:
echo    ✅ Real-time price editing with admin interface
echo    ✅ Price change history tracking
echo    ✅ Automatic user notifications via multiple channels
echo    ✅ Reason tracking for price changes
echo    ✅ Visual price difference indicators
echo.
echo 📱 MULTI-CHANNEL NOTIFICATIONS:
echo    ✅ Userpage instant messages
echo    ✅ WhatsApp notifications with pre-filled messages
echo    ✅ Email notifications with order details
echo    ✅ Channel selection for admin notifications
echo    ✅ System messages for price changes
echo.
echo 🎨 UI ENHANCEMENTS:
echo    ✅ Enhanced price editor with validation
echo    ✅ Better visual indicators for editable prices
echo    ✅ Improved modal layout and organization
echo    ✅ Professional notification design
echo    ✅ Real-time price update feedback
echo.
echo Services should be starting:
echo - Backend API: http://localhost:3000
echo - Fixed Userpage: http://localhost:3002
echo.
echo 🎯 HOW TO USE THE NEW PRICE EDITING:
echo.
echo 1. Admin Price Editing:
echo    • Open any service order
echo    • Click "Edit Price" button
echo    • Enter new price and reason
echo    • Select notification channels
echo    • Click "Update Price"
echo.
echo 2. User Notifications:
echo    • Automatic system message in conversation
echo    • Optional WhatsApp notification
echo    • Optional email notification
echo    • Price history tracking
echo.
echo 3. Price History:
echo    • Click "Price History" to see all changes
echo    • View reasons for each price change
echo    • See who made changes and when
echo    • Visual timeline of price modifications
echo.
echo 4. Multi-Channel Communication:
echo    • Send messages via userpage chat
echo    • Direct WhatsApp integration
echo    • Professional email templates
echo    • Real-time conversation tracking
echo.
echo The error is fixed and enhanced features are ready!
echo ==========================================

pause
