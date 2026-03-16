# ICSRT Social Media Setup Script
Write-Host "=======================================" -ForegroundColor Green
Write-Host "    ICSRT Social Media Setup Tool     " -ForegroundColor Green  
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Set working directory
Set-Location "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

Write-Host "✅ Setting up social media system..." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Start the server in a new process
Write-Host "🚀 Starting ICSRT Database Server..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'd:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db'; Write-Host 'Starting ICSRT Server with Social Media Support...' -ForegroundColor Green; node server.js"

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test the social media API
Write-Host "🔍 Testing social media API endpoints..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/social-links" -Method GET -UseBasicParsing
    Write-Host "✅ Social Media API is working! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📱 Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  Social Media API not yet ready. Server might still be starting..." -ForegroundColor Yellow
    Write-Host "💡 Please wait a moment and check http://localhost:3000/api/social-links manually" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "         SETUP COMPLETE!              " -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start your dashboard: cd ..\icsrt-dashboard && npm start" -ForegroundColor White
Write-Host "  2. Open: http://localhost:3001" -ForegroundColor White  
Write-Host "  3. Navigate to Social Media section" -ForegroundColor White
Write-Host ""
Write-Host "🌐 API Endpoints Available:" -ForegroundColor Yellow
Write-Host "  • GET    http://localhost:3000/api/social-links" -ForegroundColor White
Write-Host "  • POST   http://localhost:3000/api/social-links" -ForegroundColor White
Write-Host "  • PUT    http://localhost:3000/api/social-links/:id" -ForegroundColor White
Write-Host "  • DELETE http://localhost:3000/api/social-links/:id" -ForegroundColor White
Write-Host ""
Write-Host "✨ Your social media management system is now ready!" -ForegroundColor Green

Read-Host "Press Enter to start the dashboard..."

# Start dashboard
Set-Location "..\icsrt-dashboard"
Write-Host "🚀 Starting ICSRT Dashboard..." -ForegroundColor Yellow
npm start
