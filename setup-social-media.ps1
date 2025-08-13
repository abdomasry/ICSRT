# Social Media Setup Script for ICSRT
# This script sets up the social media management system

Write-Host "🔗 ICSRT Social Media Management Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
Write-Host "📁 Current directory: $currentDir" -ForegroundColor Yellow

# Function to check if a service is running on a port
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Step 1: Check if database server is running
Write-Host "🔍 Checking if database server is running on port 3000..." -ForegroundColor Yellow
if (Test-Port -Port 3000) {
    Write-Host "✅ Database server is running!" -ForegroundColor Green
    
    # Step 2: Setup default social media links
    Write-Host ""
    Write-Host "📝 Setting up default social media links..." -ForegroundColor Yellow
    
    Set-Location "icsrt-db"
    
    try {
        $setupResult = node setup-default-social-links.js
        Write-Host $setupResult
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Default social links created successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Default links may already exist or there was an issue." -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Error setting up default social links: $_" -ForegroundColor Red
    }
    
    # Step 3: Test the API endpoints
    Write-Host ""
    Write-Host "🧪 Testing Social Media API..." -ForegroundColor Yellow
    
    try {
        $testResult = node test-social-media-api.js
        Write-Host $testResult
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ API tests passed!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Some API tests may have failed." -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Error testing API: $_" -ForegroundColor Red
    }
    
    Set-Location ".."
    
} else {
    Write-Host "❌ Database server is not running!" -ForegroundColor Red
    Write-Host "💡 Please start the database server first:" -ForegroundColor Yellow
    Write-Host "   cd icsrt-db" -ForegroundColor White
    Write-Host "   node server.js" -ForegroundColor White
    Write-Host ""
    Write-Host "🔄 Would you like to start the database server now? (y/n): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "🚀 Starting database server..." -ForegroundColor Yellow
        Set-Location "icsrt-db"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js"
        Start-Sleep -Seconds 3
        Set-Location ".."
        
        Write-Host "✅ Database server started in new window!" -ForegroundColor Green
        Write-Host "🔄 Please run this script again to continue setup." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start the dashboard: cd icsrt-dashboard && npm start" -ForegroundColor White
Write-Host "2. Navigate to 'Social Media' in the dashboard sidebar" -ForegroundColor White
Write-Host "3. Update the social media URLs to match your actual accounts" -ForegroundColor White
Write-Host "4. Start the userpage: cd icsrt-userpage && npm start" -ForegroundColor White
Write-Host "5. Check the footer section to see your social media links" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Dashboard Management:" -ForegroundColor Cyan
Write-Host "- Add new social media platforms" -ForegroundColor White
Write-Host "- Enable/disable links" -ForegroundColor White
Write-Host "- Reorder links" -ForegroundColor White
Write-Host "- Update URLs and labels" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Supported Platforms:" -ForegroundColor Cyan
Write-Host "Facebook, Twitter, Instagram, LinkedIn, YouTube, TikTok," -ForegroundColor White
Write-Host "WhatsApp, Telegram, Discord, Snapchat, Pinterest, GitHub," -ForegroundColor White
Write-Host "Website, and Custom links" -ForegroundColor White
Write-Host ""
Write-Host "✨ Setup completed! Social Media Management is ready to use." -ForegroundColor Green
