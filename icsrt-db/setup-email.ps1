# ICSRT Email Configuration Setup
# This script helps configure email settings for verification

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   ICSRT Email Configuration Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you configure email for ICSRT verification system." -ForegroundColor Yellow
Write-Host ""

Write-Host "IMPORTANT: You need to set up App Password for your email provider:" -ForegroundColor Red
Write-Host ""

Write-Host "For Gmail:" -ForegroundColor Green
Write-Host "1. Enable 2-Factor Authentication in your Google Account"
Write-Host "2. Go to Security > 2-Step Verification > App passwords"
Write-Host "3. Generate an app password for 'Mail'"
Write-Host "4. Use your Gmail address and the generated app password"
Write-Host ""

Write-Host "For Yahoo:" -ForegroundColor Green
Write-Host "1. Enable 2-Factor Authentication in Yahoo Account Security"
Write-Host "2. Generate an app password for 'Mail'"
Write-Host "3. Use your Yahoo address and the generated app password"
Write-Host ""

Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Get email configuration from user
$EmailAddress = Read-Host "Enter your email address"
$EmailPassword = Read-Host "Enter your app password" -AsSecureString

# Convert secure string back to plain text (needed for environment variable)
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($EmailPassword)
$EmailPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Yellow

# Set environment variables
[Environment]::SetEnvironmentVariable("EMAIL_USER", $EmailAddress, "User")
[Environment]::SetEnvironmentVariable("EMAIL_PASS", $EmailPasswordPlain, "User")

# Also set for current session
$env:EMAIL_USER = $EmailAddress
$env:EMAIL_PASS = $EmailPasswordPlain

Write-Host ""
Write-Host "✅ Email configuration saved!" -ForegroundColor Green
Write-Host ""

Write-Host "Current Configuration:" -ForegroundColor Cyan
Write-Host "EMAIL_USER: $EmailAddress" -ForegroundColor White
Write-Host "EMAIL_PASS: " -NoNewline -ForegroundColor White
Write-Host ("*" * $EmailPasswordPlain.Length) -ForegroundColor White

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Restart the ICSRT server (stop current server and run 'node server.js')"
Write-Host "2. Email verification will now work properly"
Write-Host "3. Test by signing up with a real email address"
Write-Host ""

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
