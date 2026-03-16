# Quick Social Media Fix Script
Write-Host "================================================" -ForegroundColor Green
Write-Host "      ICSRT SOCIAL MEDIA QUICK FIX TOOL        " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Problem Analysis:" -ForegroundColor Yellow
Write-Host "   Dashboard shows: 'Endpoint not found' and '404 (Not Found)'" -ForegroundColor Red
Write-Host "   This means the backend server is not running!" -ForegroundColor Red
Write-Host ""

Write-Host "✅ Solution:" -ForegroundColor Green
Write-Host "   1. Start the social media server" -ForegroundColor White
Write-Host "   2. Server will auto-create social_links database" -ForegroundColor White
Write-Host "   3. Dashboard will connect to working API" -ForegroundColor White
Write-Host ""

Write-Host "🚀 STEP 1: Starting Social Media Server..." -ForegroundColor Yellow
Write-Host ""

# Change directory
Set-Location "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org" -ForegroundColor Cyan
    Read-Host "Press Enter after installing Node.js"
    exit 1
}

Write-Host ""
Write-Host "🎯 Starting dedicated social media server..." -ForegroundColor Yellow
Write-Host "   This server includes:" -ForegroundColor Cyan
Write-Host "   • Complete social links API (/api/social-links)" -ForegroundColor White
Write-Host "   • Automatic database setup" -ForegroundColor White  
Write-Host "   • Default social media links" -ForegroundColor White
Write-Host "   • Full CRUD operations" -ForegroundColor White
Write-Host ""

Write-Host "📡 API will be available at:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/api/social-links" -ForegroundColor White
Write-Host ""

Write-Host "⚡ Starting server now..." -ForegroundColor Green
Write-Host ""

# Start the server
& node social-media-server.js
