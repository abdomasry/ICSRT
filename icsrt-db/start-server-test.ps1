Write-Host "🚀 Starting ICSRT Backend Server..." -ForegroundColor Green
Set-Location "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

# Check if node_modules exist
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "🔄 Starting server..." -ForegroundColor Blue
node server.js
