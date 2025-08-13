// WhatsApp Integration Test Script
console.log('🔍 Testing WhatsApp Integration...');

async function testWhatsAppIntegration() {
  try {
    // Test 1: Check server connection
    console.log('\n1️⃣ Testing server connection...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server not responding');
      return;
    }

    // Test 2: Check WhatsApp status
    console.log('\n2️⃣ Checking WhatsApp service status...');
    const statusResponse = await fetch('http://localhost:3000/api/whatsapp-status');
    const status = await statusResponse.json();
    console.log('WhatsApp Status:', status);

    // Test 3: Check WhatsApp config
    console.log('\n3️⃣ Checking WhatsApp configuration...');
    const configResponse = await fetch('http://localhost:3000/api/whatsapp-config');
    const config = await configResponse.json();
    console.log('WhatsApp Config:', config);

    // Test 4: Send test contact request
    console.log('\n4️⃣ Sending test contact request...');
    const testMessage = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'WhatsApp Integration Test',
      message: 'This is a test message to verify WhatsApp integration is working correctly.',
      category: 'general',
      timestamp: new Date().toISOString()
    };

    const contactResponse = await fetch('http://localhost:3000/api/contact-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });

    if (contactResponse.ok) {
      console.log('✅ Test message sent to server');
      console.log('📱 Check your WhatsApp and server console for messages');
    } else {
      console.log('❌ Failed to send test message');
    }

    // Test 5: Check notifications
    console.log('\n5️⃣ Checking generated notifications...');
    const notificationsResponse = await fetch('http://localhost:3000/api/whatsapp-notifications');
    const notifications = await notificationsResponse.json();
    console.log('Recent notifications:', notifications.slice(0, 3));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure your server is running on port 3000');
  }
}

// Run the test
testWhatsAppIntegration();
