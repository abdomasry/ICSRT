# PowerShell script to set up and test social media management system

Write-Host "🔗 Setting up Social Media Management System..." -ForegroundColor Cyan

# Check if server is running
Write-Host "`n1. Checking if database server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/social-links" -Method GET -TimeoutSec 5
    Write-Host "✅ Server is running!" -ForegroundColor Green
    
    # Parse response
    $data = $response.Content | ConvertFrom-Json
    if ($data.success) {
        Write-Host "📊 Found $($data.data.Count) existing social links" -ForegroundColor Blue
        
        if ($data.data.Count -eq 0) {
            Write-Host "`n2. Creating default social media links..." -ForegroundColor Yellow
            node setup-default-social-links.js
        } else {
            Write-Host "`n📋 Existing social links:" -ForegroundColor Blue
            foreach ($link in $data.data) {
                $status = if ($link.enabled) { "✅" } else { "❌" }
                Write-Host "   $status $($link.label): $($link.url)" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host "`n3. Testing API endpoints..." -ForegroundColor Yellow
    node test-social-media-api.js
    
} catch {
    Write-Host "❌ Server is not running or not accessible!" -ForegroundColor Red
    Write-Host "💡 Please start the server first:" -ForegroundColor Yellow
    Write-Host "   cd icsrt-db" -ForegroundColor Gray
    Write-Host "   node server.js" -ForegroundColor Gray
    Write-Host "`n🔄 Attempting to start server..." -ForegroundColor Yellow
    
    # Try to start server
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -WindowStyle Normal
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Test again
    try {
        $response2 = Invoke-WebRequest -Uri "http://localhost:3000/api/social-links" -Method GET -TimeoutSec 5
        Write-Host "✅ Server started successfully!" -ForegroundColor Green
        
        Write-Host "`n2. Creating default social media links..." -ForegroundColor Yellow
        node setup-default-social-links.js
        
        Write-Host "`n3. Testing API endpoints..." -ForegroundColor Yellow
        node test-social-media-api.js
        
    } catch {
        Write-Host "❌ Failed to start server automatically" -ForegroundColor Red
        Write-Host "Please start the server manually and run this script again." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open dashboard: http://localhost:3001" -ForegroundColor White
Write-Host "2. Navigate to 'Social Media' in the sidebar" -ForegroundColor White
Write-Host "3. Update social links with your actual URLs" -ForegroundColor White
Write-Host "4. Check userpage: http://localhost:3002" -ForegroundColor White
Write-Host "5. Verify social links appear in the footer section" -ForegroundColor White

Write-Host "`n🎉 Social Media Management System setup complete!" -ForegroundColor Green
