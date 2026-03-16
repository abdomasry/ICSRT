Write-Host "Starting ICSRT Database Server with Debug Info..." -ForegroundColor Green
Write-Host ""

Write-Host "Checking if Node.js is available..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan
$targetDir = "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"
Write-Host "Target directory: $targetDir" -ForegroundColor Cyan

if (Test-Path $targetDir) {
    Set-Location $targetDir
    Write-Host "Changed to: $(Get-Location)" -ForegroundColor Green
} else {
    Write-Host "ERROR: Target directory does not exist!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Checking if server.js exists..." -ForegroundColor Yellow
if (Test-Path "server.js") {
    Write-Host "server.js found!" -ForegroundColor Green
} else {
    Write-Host "ERROR: server.js not found in current directory!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting server on port 3000..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "Running: node server.js" -ForegroundColor Cyan

try {
    node server.js
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to start server!" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Server stopped. Press any key to close..." -ForegroundColor Yellow
Read-Host
