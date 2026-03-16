# ICSRT Social Media Server Starter
Write-Host "=======================================" -ForegroundColor Green
Write-Host "    ICSRT Social Media Server         " -ForegroundColor Green  
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Change to the correct directory
Set-Location "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

Write-Host "🚀 Starting ICSRT Social Media Server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Features:" -ForegroundColor Cyan
Write-Host "  • Social Links Management API" -ForegroundColor White
Write-Host "  • Database auto-initialization" -ForegroundColor White  
Write-Host "  • Default social links setup" -ForegroundColor White
Write-Host "  • Full CRUD operations" -ForegroundColor White
Write-Host ""
Write-Host "🌐 API Endpoints:" -ForegroundColor Cyan
Write-Host "  • http://localhost:3000/api/social-links" -ForegroundColor White
Write-Host "  • http://localhost:3000/api/health" -ForegroundColor White
Write-Host ""

# Start the social media server
Write-Host "🎯 Starting server..." -ForegroundColor Yellow
node social-media-server.js
