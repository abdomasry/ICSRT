# 🚀 Social Media Management - Test Script
# This script starts both backend and userpage for testing social media functionality

Write-Host "🚀 Starting Social Media Management Test Environment..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# Function to start a process in a new window
function Start-InNewWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory
    )
    
    Write-Host "🔄 Starting $Title..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDirectory'; Write-Host '$Title Started' -ForegroundColor Green; $Command" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Start Backend Server
Write-Host "1️⃣ Starting Backend Server (Port 3000)..." -ForegroundColor Blue
Start-InNewWindow -Title "ICSRT Backend Server" -Command "npm start" -WorkingDirectory "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

# Wait a bit for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Userpage
Write-Host "2️⃣ Starting Userpage (Port 3002)..." -ForegroundColor Blue
Start-InNewWindow -Title "ICSRT Userpage" -Command "npm start" -WorkingDirectory "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-userpage"

# Wait a bit for userpage to start
Write-Host "⏳ Waiting for userpage to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "✅ Social Media Test Environment Ready!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📱 Access URLs:" -ForegroundColor White
Write-Host "   🌐 Userpage: http://localhost:3002" -ForegroundColor Cyan
Write-Host "   🔧 API: http://localhost:3000/api/social-links" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Test Steps:" -ForegroundColor White
Write-Host "   1. Visit the userpage to see social media links in footer" -ForegroundColor Gray
Write-Host "   2. Check both the banner section and company info section" -ForegroundColor Gray
Write-Host "   3. Test hover effects and tooltips" -ForegroundColor Gray
Write-Host "   4. Verify links open correctly in new tabs" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Note: If no social links appear, add them via the dashboard:" -ForegroundColor Yellow
Write-Host "   http://localhost:3001/social-media" -ForegroundColor Yellow

# Open browser to userpage
Start-Sleep -Seconds 3
Write-Host "🌐 Opening userpage in browser..." -ForegroundColor Green
Start-Process "http://localhost:3002"

Write-Host ""
Write-Host "✨ Happy Testing! Press any key to close this window..." -ForegroundColor Green
Read-Host
