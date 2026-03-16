// Test Email Sending - ICSRT
// This script tests if email configuration is working

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('\n' + '='.repeat(60));
  console.log('📧 ICSRT Email Test');
  console.log('='.repeat(60) + '\n');
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass || emailUser === 'your-email@gmail.com' || emailPass === 'your-app-password-here') {
    console.log('❌ Email credentials not configured in .env file');
    console.log('\n📖 To configure email:');
    console.log('   1. Run: node setup-email.js');
    console.log('   2. Or manually edit .env file');
    console.log('   3. Set EMAIL_USER and EMAIL_PASS variables\n');
    process.exit(1);
  }
  
  console.log('📧 Email User:', emailUser);
  console.log('🔑 Password:', '*'.repeat(emailPass.length) + '\n');
  
  console.log('🔧 Creating email transporter...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔍 Verifying connection...');
    await transporter.verify();
    console.log('✅ Email transporter verified successfully!\n');
    
    // Ask if user wants to send test email
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Send a test email? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        rl.question('Enter recipient email address: ', async (recipient) => {
          try {
            console.log('\n📤 Sending test email to:', recipient);
            
            const result = await transporter.sendMail({
              from: `"ICSRT Test" <${emailUser}>`,
              to: recipient,
              subject: 'ICSRT Email Test - Configuration Successful! ✅',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 32px;">✅ Success!</h1>
                    <p style="margin: 10px 0 0; font-size: 18px;">Email Configuration Working</p>
                  </div>
                  <div style="padding: 30px; background-color: #f8f9fa;">
                    <h2 style="color: #3B82F6;">ICSRT Email System Configured</h2>
                    <p>Your email configuration is working correctly!</p>
                    <ul style="color: #666;">
                      <li>✅ Email transporter verified</li>
                      <li>✅ Test email sent successfully</li>
                      <li>✅ Ready to send user verification codes</li>
                      <li>✅ Ready to send newsletters</li>
                    </ul>
                    <p>All email features are now active:</p>
                    <ul style="color: #666;">
                      <li>User email verification</li>
                      <li>Newsletter subscriptions</li>
                      <li>Service order notifications</li>
                      <li>Password reset emails</li>
                    </ul>
                  </div>
                  <div style="padding: 20px; text-align: center; color: #666; font-size: 14px;">
                    <p>Test Date: ${new Date().toLocaleString()}</p>
                    <p>From: ${emailUser}</p>
                  </div>
                </div>
              `
            });
            
            console.log('✅ Test email sent successfully!');
            console.log('📬 Message ID:', result.messageId);
            console.log('\n🎉 Email system is fully configured and working!\n');
            
          } catch (error) {
            console.error('\n❌ Failed to send test email:');
            console.error('Error:', error.message);
            
            if (error.message.includes('Invalid login')) {
              console.log('\n💡 Tips:');
              console.log('   - Make sure you\'re using App Password (not regular password)');
              console.log('   - Enable 2FA: https://myaccount.google.com/security');
              console.log('   - Generate App Password: https://myaccount.google.com/apppasswords');
            }
          } finally {
            rl.close();
          }
        });
      } else {
        console.log('\n✅ Email configuration verified (test email not sent)');
        console.log('🚀 You can now restart the server to enable email features\n');
        rl.close();
      }
    });
    
  } catch (error) {
    console.error('\n❌ Email verification failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   1. EMAIL_USER is correct Gmail address');
      console.log('   2. EMAIL_PASS is App Password (16 characters)');
      console.log('   3. 2FA is enabled on your Google account');
      console.log('   4. App Password is generated from: https://myaccount.google.com/apppasswords\n');
    } else {
      console.log('\n💡 Please check:');
      console.log('   1. Internet connection is working');
      console.log('   2. Gmail SMTP is not blocked by firewall');
      console.log('   3. Email credentials are correct in .env file\n');
    }
    
    process.exit(1);
  }
}

testEmail();
