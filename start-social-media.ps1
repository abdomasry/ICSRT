Write-Host "🚀 ICSRT Social Media Management Setup & Test Script" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Set the base directory
$baseDir = "d:\Abdo\WORK\Real Projects\ICSRT++"

Write-Host "`n📋 Setup Steps:" -ForegroundColor Yellow
Write-Host "1. Starting backend server..." -ForegroundColor Cyan

# Start backend server in new window
$backendPath = Join-Path $baseDir "icsrt-db"
$backendScript = {
    Set-Location "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"
    Write-Host "🔄 Starting ICSRT Backend Server..." -ForegroundColor Green
    node server.js
}

Start-Process powershell -ArgumentList "-Command", "& {$($backendScript.ToString())}" -WindowStyle Normal

Write-Host "✅ Backend server starting in new window..." -ForegroundColor Green

# Wait a moment for server to start
Write-Host "`n⏳ Waiting 5 seconds for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test the API
Write-Host "`n2. Testing Social Media API..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/social-links" -Method Get -TimeoutSec 10
    
    if ($response) {
        Write-Host "✅ API is working!" -ForegroundColor Green
        
        # Check response format
        if ($response.success -and $response.data) {
            $linkCount = $response.data.Count
            Write-Host "📊 Found $linkCount social links in database" -ForegroundColor Blue
            
            if ($linkCount -gt 0) {
                Write-Host "📋 Sample link:" -ForegroundColor Blue
                $sample = $response.data[0]
                Write-Host "   Platform: $($sample.platform)" -ForegroundColor Gray
                Write-Host "   URL: $($sample.url)" -ForegroundColor Gray
                Write-Host "   Enabled: $($sample.enabled)" -ForegroundColor Gray
            }
        } elseif ($response -is [Array]) {
            $linkCount = $response.Count
            Write-Host "📊 Found $linkCount social links (direct array format)" -ForegroundColor Blue
        } else {
            Write-Host "⚠️ Unexpected API response format" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Cannot connect to API. Make sure the backend server is running." -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Starting dashboard..." -ForegroundColor Cyan

# Start dashboard in new window
$dashboardPath = Join-Path $baseDir "icsrt-dashboard"
$dashboardScript = {
    Set-Location "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-dashboard"
    Write-Host "🔄 Starting ICSRT Dashboard..." -ForegroundColor Green
    npm start
}

Start-Process powershell -ArgumentList "-Command", "& {$($dashboardScript.ToString())}" -WindowStyle Normal

Write-Host "✅ Dashboard starting in new window..." -ForegroundColor Green

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait for dashboard to load (usually takes 30-60 seconds)" -ForegroundColor White
Write-Host "2. Dashboard will open at: http://localhost:3001" -ForegroundColor White
Write-Host "3. Navigate to: Social Media Management" -ForegroundColor White
Write-Host "4. Test adding, editing, and deleting social links" -ForegroundColor White
Write-Host "5. Check browser console for detailed logs" -ForegroundColor White

Write-Host "`n🔧 Userpage Integration:" -ForegroundColor Yellow
Write-Host "To display social links in your userpage footer:" -ForegroundColor White
Write-Host "   import SocialMediaFooter from './components/SocialMediaFooter';" -ForegroundColor Gray
Write-Host "   <SocialMediaFooter />" -ForegroundColor Gray

Write-Host "`n📊 API Endpoints Available:" -ForegroundColor Yellow
Write-Host "   GET    /api/social-links        - Get all social links" -ForegroundColor Gray
Write-Host "   POST   /api/social-links        - Create new social link" -ForegroundColor Gray
Write-Host "   PUT    /api/social-links/:id    - Update social link" -ForegroundColor Gray
Write-Host "   DELETE /api/social-links/:id    - Delete social link" -ForegroundColor Gray

Write-Host "`n🐛 Troubleshooting:" -ForegroundColor Yellow
Write-Host "If you encounter issues:" -ForegroundColor White
Write-Host "   • Check if MongoDB is running" -ForegroundColor Gray
Write-Host "   • Verify backend server started without errors" -ForegroundColor Gray
Write-Host "   • Check browser console for JavaScript errors" -ForegroundColor Gray
Write-Host "   • Ensure port 3000 (backend) and 3001 (frontend) are available" -ForegroundColor Gray

Write-Host "`n✨ Social Media Management is ready!" -ForegroundColor Green
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
