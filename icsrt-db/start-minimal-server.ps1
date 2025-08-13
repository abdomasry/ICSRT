Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ICSRT Minimal Tickets Server Starter" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting minimal tickets server..." -ForegroundColor Yellow
Write-Host "This simplified server includes only ticket endpoints" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
node minimal-tickets-server.js
