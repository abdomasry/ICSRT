// Test sending contact request with phone number
const fetch = require('node-fetch');

async function testContactRequestWithPhone() {
  console.log('📞 TESTING CONTACT REQUEST WITH PHONE');
  console.log('====================================');
  
  const testData = {
    name: 'Marco',
    email: 'ilv2dtagin@wyoxafp.com',
    phone: '+201145398963', // Marco's phone from screenshot
    subject: 'Test WhatsApp Integration',
    message: 'Testing automatic phone number inclusion for WhatsApp replies',
    category: 'technical',
    userId: null, // Will be looked up by email
    timestamp: new Date().toISOString()
  };
  
  try {
    console.log('📤 Sending contact request...');
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/contact-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Contact request sent successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
      console.log('\n🎯 Key points:');
      console.log(`✅ Phone included: ${testData.phone}`);
      console.log('✅ Should appear in dashboard with WhatsApp option');
      console.log('✅ WhatsApp reply should use this phone number');
    } else {
      const errorData = await response.json();
      console.log('❌ Failed to send contact request');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Make sure the server is running: node server.js');
  }
}

// Run the test
testContactRequestWithPhone();
