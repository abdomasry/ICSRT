// Email Setup Wizard for ICSRT
// This script helps you configure email functionality

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n' + '='.repeat(60));
  console.log('📧 ICSRT Email Configuration Wizard');
  console.log('='.repeat(60) + '\n');
  
  console.log('This wizard will help you configure email functionality.');
  console.log('You need a Gmail account with App Password enabled.\n');
  
  console.log('📖 Steps to get Gmail App Password:');
  console.log('1. Go to: https://myaccount.google.com/security');
  console.log('2. Enable 2-Factor Authentication (2FA)');
  console.log('3. Go to: https://myaccount.google.com/apppasswords');
  console.log('4. Generate an App Password for "Mail"');
  console.log('5. Copy the 16-character password\n');
  
  const emailUser = await question('Enter your Gmail address (e.g., icsrt.system@gmail.com): ');
  const emailPass = await question('Enter your Gmail App Password (16 characters): ');
  
  if (!emailUser || !emailPass) {
    console.log('\n❌ Email and password are required!');
    rl.close();
    return;
  }
  
  // Validate email format
  if (!/^[^\s@]+@gmail\.com$/.test(emailUser)) {
    console.log('\n⚠️  Warning: This doesn\'t look like a Gmail address.');
    const proceed = await question('Continue anyway? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      rl.close();
      return;
    }
  }
  
  // Read existing .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (err) {
    console.log('\n⚠️  .env file not found, creating new one...');
  }
  
  // Update or add EMAIL_USER and EMAIL_PASS
  const lines = envContent.split('\n');
  let userUpdated = false;
  let passUpdated = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('EMAIL_USER=')) {
      lines[i] = `EMAIL_USER=${emailUser}`;
      userUpdated = true;
    } else if (lines[i].startsWith('EMAIL_PASS=')) {
      lines[i] = `EMAIL_PASS=${emailPass}`;
      passUpdated = true;
    }
  }
  
  // Add if not found
  if (!userUpdated) {
    lines.push(`EMAIL_USER=${emailUser}`);
  }
  if (!passUpdated) {
    lines.push(`EMAIL_PASS=${emailPass}`);
  }
  
  // Write back to .env
  fs.writeFileSync(envPath, lines.join('\n'));
  
  console.log('\n✅ Email configuration saved to .env file!');
  console.log('\n📝 Configuration:');
  console.log(`   EMAIL_USER: ${emailUser}`);
  console.log(`   EMAIL_PASS: ${'*'.repeat(emailPass.length)}`);
  
  console.log('\n🔄 Please restart the server for changes to take effect:');
  console.log('   1. Stop the current server (Ctrl+C)');
  console.log('   2. Run: node server.js\n');
  
  rl.close();
}

setup().catch(err => {
  console.error('Error:', err);
  rl.close();
});
