# PowerShell script to start userpage
Set-Location "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-userpage"
$env:PORT = "3002"
Write-Host "Starting ICSRT User Page on port 3002..." -ForegroundColor Green
npm start
