Write-Host "🚀 ICSRT Backend Server Starter" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Navigate to the server directory
Set-Location "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if server.js exists
if (!(Test-Path "server.js")) {
    Write-Host "❌ server.js not found in current directory!" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Kill any existing processes on port 3000
Write-Host "🛑 Checking for existing processes on port 3000..." -ForegroundColor Yellow
try {
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "Found processes on port 3000, attempting to stop them..." -ForegroundColor Yellow
        $processes | ForEach-Object {
            try {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "✅ Stopped process $($_.OwningProcess)" -ForegroundColor Green
            } catch {
                Write-Host "⚠️ Could not stop process $($_.OwningProcess)" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "ℹ️ No processes found on port 3000" -ForegroundColor Cyan
}

# Start the server
Write-Host "`n🚀 Starting ICSRT Backend Server..." -ForegroundColor Green
Write-Host "📍 Directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🌐 Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🧪 Test endpoint: http://localhost:3000/test" -ForegroundColor Cyan
Write-Host "🔗 Social Links API: http://localhost:3000/api/social-links" -ForegroundColor Cyan
Write-Host "`n⚠️ Keep this window open while using the dashboard!" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Run the server
try {
    node server.js
} catch {
    Write-Host "`n❌ Server failed to start!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🛑 Server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
