Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       ICSRT Backend Server Starter" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Node.js server..." -ForegroundColor Yellow
Write-Host "If you see 'Server is running on http://localhost:3000'" -ForegroundColor Green
Write-Host "then the server started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
node server.js
