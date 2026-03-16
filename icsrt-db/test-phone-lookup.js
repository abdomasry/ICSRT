// Test script for phone number lookup API
const fetch = require('node-fetch');

const testPhoneLookup = async () => {
  try {
    console.log('🔍 Testing phone lookup API...');
    
    // Test with a sample email (replace with actual user email from your database)
    const testEmail = 'test@example.com';
    
    const response = await fetch(`http://localhost:3000/api/users/phone/${encodeURIComponent(testEmail)}`);
    const data = await response.json();
    
    console.log('📋 Response:', response.status);
    console.log('💾 Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Phone lookup successful:', data.user.phone);
    } else {
      console.log('❌ Phone lookup failed:', data.error);
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
};

testPhoneLookup();
