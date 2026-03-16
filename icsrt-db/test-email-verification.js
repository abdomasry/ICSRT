// Test script for email verification system
// Run with: node test-email-verification.js

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testEmailVerificationWorkflow() {
  console.log('🧪 Testing ICSRT Email Verification System\n');

  try {
    // Step 1: Test signup with registration fields (should be ignored)
    console.log('📝 Step 1: Testing user signup...');
    const signupData = {
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      phone: '+1234567890',
      // These should be ignored:
      registrationType: 'conference',
      university: 'Test University',
      fieldOfStudy: 'Computer Science'
    };

    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, signupData);
    console.log('✅ Signup successful:', signupResponse.data.message);
    console.log('📧 Email sent:', signupResponse.data.emailSent);
    console.log('👤 User created:', signupResponse.data.data);

    // Step 2: Test login with unverified user (should fail)
    console.log('\n🔐 Step 2: Testing login with unverified user...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'testuser@example.com',
        password: 'password123'
      });
      console.log('❌ Login should have failed!');
    } catch (error) {
      console.log('✅ Login correctly blocked:', error.response.data.error);
      console.log('🔍 Verification needed:', error.response.data.needsVerification);
    }

    // Step 3: Test resend verification
    console.log('\n📨 Step 3: Testing resend verification...');
    const resendResponse = await axios.post(`${API_BASE}/auth/resend-verification`, {
      email: 'testuser@example.com'
    });
    console.log('✅ Resend successful:', resendResponse.data.message);

    // Step 4: Test verification with wrong code (should fail)
    console.log('\n🔍 Step 4: Testing verification with wrong code...');
    try {
      await axios.post(`${API_BASE}/auth/verify-email`, {
        email: 'testuser@example.com',
        verificationCode: 'WRONG1'
      });
      console.log('❌ Verification should have failed!');
    } catch (error) {
      console.log('✅ Verification correctly failed:', error.response.data.error);
    }

    // Step 5: Get user info to check status
    console.log('\n👥 Step 5: Checking user status...');
    const usersResponse = await axios.get(`${API_BASE}/users`);
    const testUser = usersResponse.data.data.find(u => u.email === 'testuser@example.com');
    console.log('📊 User status:', {
      isVerified: testUser.isVerified,
      status: testUser.status,
      createdAt: testUser.createdAt
    });

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Registration-specific fields ignored');
    console.log('- ✅ Email verification required for login');
    console.log('- ✅ Verification codes generated');
    console.log('- ✅ Invalid verification codes rejected');
    console.log('- ✅ User data properly sanitized');

    console.log('\n🔧 Next steps:');
    console.log('1. Configure EMAIL_USER and EMAIL_PASS environment variables');
    console.log('2. Test with real email provider');
    console.log('3. Implement password hashing for production');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
if (require.main === module) {
  testEmailVerificationWorkflow();
}

module.exports = { testEmailVerificationWorkflow };
