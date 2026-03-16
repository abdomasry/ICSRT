Write-Host "================================================================" -ForegroundColor Green
Write-Host "                    ICSRT++ System Startup" -ForegroundColor Green  
Write-Host "================================================================" -ForegroundColor Green

Set-Location "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"

Write-Host "🔍 Testing Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`n🧪 Testing database and creating sample data..." -ForegroundColor Yellow
try {
    node quick-db-test.js
    Write-Host "✅ Database test completed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Database test had issues, continuing..." -ForegroundColor Yellow
}

Write-Host "`n🚀 Starting server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API endpoint: GET /api/user/service-orders?userEmail=testuser@icsrt.com" -ForegroundColor Cyan
Write-Host "Test user email: testuser@icsrt.com" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Green

npm start
