# Start ICSRT Backend Server
Write-Host "Starting ICSRT Backend Server..." -ForegroundColor Green
Set-Location $PSScriptRoot
node server.js
