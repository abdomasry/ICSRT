// Gmail Email Test Script for ICSRT
const nodemailer = require('nodemailer');
require('dotenv').config();

async function setupAndTestEmail() {
    console.log('🔧 ICSRT Email Configuration Setup & Test');
    console.log('═══════════════════════════════════════════');
    
    // Check if dotenv is working
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('❌ Environment variables not loaded');
        console.log('📝 Please edit .env file with your Gmail credentials:');
        console.log('   EMAIL_USER=your-email@gmail.com');
        console.log('   EMAIL_PASS=your-16-char-app-password');
        console.log('');
        console.log('🔑 To get Gmail App Password:');
        console.log('   1. Go to Google Account Settings');
        console.log('   2. Security → 2-Step Verification (enable if not enabled)');
        console.log('   3. App passwords → Generate password for "Mail"');
        console.log('   4. Copy the 16-character password to .env file');
        return;
    }
    
    console.log(`📧 Email: ${process.env.EMAIL_USER}`);
    console.log(`🔐 Password: ${'*'.repeat(process.env.EMAIL_PASS.length)} (${process.env.EMAIL_PASS.length} chars)`);
    console.log('');
    
    // Create Gmail transporter with proper settings
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    try {
        console.log('🔌 Testing Gmail connection...');
        await transporter.verify();
        console.log('✅ Gmail SMTP connection successful!');
        console.log('');
        
        // Send test verification email
        console.log('📨 Sending test verification email...');
        const testVerificationCode = 'ABC123';
        const testToken = 'test-token-12345';
        
        const mailOptions = {
            from: `"ICSRT System" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: '🧪 ICSRT Email Verification Test',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2563eb; margin: 0;">ICSRT</h1>
                        <p style="color: #666; margin: 5px 0;">Email Verification Test</p>
                    </div>
                    
                    <div style="background: #f8fafc; border-radius: 10px; padding: 30px; margin: 20px 0;">
                        <h2 style="color: #059669; margin-top: 0;">✅ Email Configuration Success!</h2>
                        <p>Your ICSRT email verification system is now working correctly.</p>
                        
                        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #374151; margin-top: 0;">Test Verification Code:</h3>
                            <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; text-align: center; background: #eff6ff; padding: 20px; border-radius: 8px; font-family: monospace;">
                                ${testVerificationCode}
                            </div>
                        </div>
                        
                        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #374151; margin-top: 0;">Or click verification link:</h3>
                            <a href="http://localhost:3002/verify-email?token=${testToken}" 
                               style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                Verify Email Address
                            </a>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
                        <p><strong>Test Details:</strong></p>
                        <ul>
                            <li>📅 Date: ${new Date().toLocaleString()}</li>
                            <li>📧 From: ${process.env.EMAIL_USER}</li>
                            <li>🔧 Service: Gmail SMTP</li>
                            <li>✅ Status: Working</li>
                        </ul>
                        
                        <p style="margin-top: 20px;">
                            This is a test email from your ICSRT verification system. 
                            Real users will receive similar emails when they sign up.
                        </p>
                    </div>
                </div>
            `
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log(`📨 Message ID: ${result.messageId}`);
        console.log('📬 Check your Gmail inbox for the test email');
        console.log('');
        console.log('🎉 Your email configuration is working perfectly!');
        console.log('🚀 Email verification will now work for user signups');
        
    } catch (error) {
        console.log('❌ Email configuration failed:');
        console.log(`Error: ${error.message}`);
        console.log('');
        
        if (error.code === 'EAUTH') {
            console.log('🔐 Authentication Error Solutions:');
            console.log('   1. Make sure 2-Factor Authentication is enabled on Gmail');
            console.log('   2. Generate a new App Password (not your regular password)');
            console.log('   3. Use the 16-character app password in .env file');
            console.log('   4. Make sure EMAIL_USER is your full Gmail address');
        } else if (error.code === 'ENOTFOUND') {
            console.log('🌐 Network Error Solutions:');
            console.log('   1. Check your internet connection');
            console.log('   2. Try disabling antivirus/firewall temporarily');
            console.log('   3. Check if Gmail SMTP is blocked by your ISP');
        } else {
            console.log('🔧 Other Solutions:');
            console.log('   1. Double-check your Gmail credentials');
            console.log('   2. Try generating a new App Password');
            console.log('   3. Make sure Gmail account is active');
        }
    }
}

setupAndTestEmail();
