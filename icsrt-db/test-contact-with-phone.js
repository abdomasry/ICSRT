// Test creating a contact request with phone number
const fetch = require('node-fetch');

async function createTestContactWithPhone() {
  try {
    const testMessage = {
      name: 'Test User With Phone',
      email: 'testuser@example.com',
      phone: '+1987654321', // Add phone number to contact request
      subject: 'WhatsApp Direct Link Test',
      message: 'This is a test message to verify the direct WhatsApp link functionality works correctly.',
      category: 'general',
      timestamp: new Date().toISOString()
    };

    console.log('🚀 Creating test contact request with phone number...');
    console.log('📱 Phone:', testMessage.phone);
    
    const response = await fetch('http://localhost:3000/api/contact-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test contact request created successfully!');
      console.log('📧 ID:', result.id);
      console.log('');
      console.log('💡 Now check the dashboard:');
      console.log('1. Go to Contact Requests');
      console.log('2. Find "Test User With Phone"');
      console.log('3. Click "Reply via WhatsApp"');
      console.log('4. It should go directly to +1987654321');
    } else {
      console.error('❌ Failed to create test contact:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestContactWithPhone();
