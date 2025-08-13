Write-Host "🔄 Restarting ICSRT Server with CORS Fix..." -ForegroundColor Green
Write-Host ""

$serverPath = "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

# Check if server directory exists
if (-not (Test-Path $serverPath)) {
    Write-Host "❌ Server directory not found: $serverPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location $serverPath

# Check if any Node.js processes are running on port 3000
Write-Host "🔍 Checking for existing server processes..." -ForegroundColor Yellow
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "⚠️  Found existing Node.js processes. You may need to stop them manually." -ForegroundColor Yellow
    $processes | ForEach-Object { Write-Host "   PID: $($_.Id)" -ForegroundColor Cyan }
    Write-Host ""
}

# Check if port 3000 is in use
$portCheck = netstat -an | Select-String ":3000"
if ($portCheck) {
    Write-Host "⚠️  Port 3000 appears to be in use:" -ForegroundColor Yellow
    $portCheck | ForEach-Object { Write-Host "   $_" -ForegroundColor Cyan }
    Write-Host ""
}

Write-Host "🚀 Starting server with CORS fix (PATCH method now allowed)..." -ForegroundColor Green
Write-Host "📝 Changes made:"
Write-Host "   - Added 'PATCH' to allowed CORS methods" -ForegroundColor Cyan
Write-Host "   - This should fix the resolve/close ticket issues" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Server will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "🎫 Dashboard will connect from: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    node server.js
} catch {
    Write-Host ""
    Write-Host "❌ Server failed to start!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're in the correct directory" -ForegroundColor Cyan
    Write-Host "2. Check if port 3000 is already in use" -ForegroundColor Cyan
    Write-Host "3. Verify server.js file exists" -ForegroundColor Cyan
    Write-Host "4. Check MongoDB connection settings" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Server stopped. Press any key to close..." -ForegroundColor Yellow
Read-Host
