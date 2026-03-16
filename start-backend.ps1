# PowerShell script to start ICSRT backend server
Set-Location "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"
Write-Host "Starting ICSRT Backend Server..."
Write-Host "Navigate to http://localhost:3000 to verify the server is running"
Write-Host "Keep this window open while using the application"
Write-Host "Press Ctrl+C to stop the server"
Write-Host ""
node server.js
