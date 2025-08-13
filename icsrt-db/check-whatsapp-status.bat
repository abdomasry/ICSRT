@echo off
echo 🔍 Checking ICSRT Server Status...
echo.

echo 1️⃣ Testing server connection...
curl -s http://localhost:3000/api/health > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Server is running
) else (
    echo ❌ Server is NOT running
    echo 💡 Start the server first: node server.js
    pause
    exit
)

echo.
echo 2️⃣ Checking WhatsApp service status...
curl -s http://localhost:3000/api/whatsapp-status
echo.

echo.
echo 3️⃣ Checking WhatsApp configuration...
curl -s http://localhost:3000/api/whatsapp-config
echo.

echo.
echo 4️⃣ Checking recent notifications...
curl -s http://localhost:3000/api/whatsapp-notifications
echo.

echo.
echo 🔧 Next steps based on results:
echo - If WhatsApp status shows "not connected": Initialize WhatsApp service
echo - If phone number is missing: Configure phone number in dashboard
echo - If notifications exist but no WhatsApp: Check WhatsApp Web connection
echo.
pause
