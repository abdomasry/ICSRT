// Test the phone lookup API endpoint
const fetch = require('node-fetch');

async function testPhoneLookup() {
  try {
    const testEmail = 'ilv2dtagin@wyoxafp.com';
    console.log(`🔍 Testing phone lookup for: ${testEmail}`);
    
    const url = `http://localhost:3000/api/users/phone/${encodeURIComponent(testEmail)}`;
    console.log(`🌐 URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (data.success && data.user.phone) {
      console.log(`✅ SUCCESS: Phone found - ${data.user.phone}`);
      
      // Test creating WhatsApp URL
      const cleanPhone = data.user.phone.replace(/[\s\-\(\)\+]/g, '');
      const message = encodeURIComponent(`Hello ${data.user.fullName}! Test message.`);
      const whatsappURL = `https://wa.me/${cleanPhone}?text=${message}`;
      console.log(`📱 WhatsApp URL: ${whatsappURL}`);
    } else {
      console.log(`❌ FAILED: No phone number found`);
    }
  } catch (error) {
    console.error('❌ Error testing phone lookup:', error);
  }
}

testPhoneLookup();
