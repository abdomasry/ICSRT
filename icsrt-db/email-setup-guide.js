// Email Configuration Setup for ICSRT
// This script helps configure email settings for the verification system

console.log('=== ICSRT Email Configuration Setup ===\n');

console.log('To enable email verification, you need to set up email credentials.');
console.log('You can use Gmail, Yahoo, Outlook, or other email providers.\n');

console.log('🔧 Gmail Setup (Recommended):');
console.log('1. Go to your Google Account settings');
console.log('2. Enable 2-Factor Authentication');
console.log('3. Generate an App Password:');
console.log('   - Go to Security > 2-Step Verification > App passwords');
console.log('   - Select "Mail" and generate a password');
console.log('4. Use your Gmail address and the generated app password\n');

console.log('🔧 Yahoo Setup:');
console.log('1. Go to Yahoo Account Security');
console.log('2. Enable 2-Factor Authentication');
console.log('3. Generate an app password for "Mail"');
console.log('4. Use your Yahoo address and the generated app password\n');

console.log('💻 To configure email in your project:');
console.log('Option 1 - Set environment variables (Recommended):');
console.log('  $env:EMAIL_USER="your-email@gmail.com"');
console.log('  $env:EMAIL_PASS="your-app-password"');
console.log('');
console.log('Option 2 - Update server.js directly:');
console.log('  Replace "your-email@gmail.com" with your actual email');
console.log('  Replace "your-app-password" with your actual app password');
console.log('');

console.log('🧪 Testing email functionality:');
console.log('After configuration, test by:');
console.log('1. Signing up with a real email address');
console.log('2. Checking if verification email arrives');
console.log('3. Using the verification code or link');
console.log('');

// Quick test function
const testEmailConfig = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('📊 Current Configuration Status:');
  console.log(`EMAIL_USER: ${emailUser ? '✅ Set' : '❌ Not set'}`);
  console.log(`EMAIL_PASS: ${emailPass ? '✅ Set' : '❌ Not set'}`);
  
  if (!emailUser || !emailPass) {
    console.log('\n⚠️  Email credentials not configured!');
    console.log('Email verification will not work until credentials are set.');
  } else {
    console.log('\n✅ Email credentials configured!');
    console.log('Email verification should work now.');
  }
};

testEmailConfig();

console.log('\n📝 For quick setup with Gmail:');
console.log('1. Replace YOUR_EMAIL and YOUR_APP_PASSWORD below');
console.log('2. Run these commands in PowerShell:');
console.log('');
console.log('$env:EMAIL_USER="YOUR_EMAIL@gmail.com"');
console.log('$env:EMAIL_PASS="YOUR_APP_PASSWORD"');
console.log('');
console.log('3. Restart your server after setting the variables');
