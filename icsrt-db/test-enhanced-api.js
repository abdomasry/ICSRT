// Test script for enhanced service orders API
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testEnhancedAPI() {
  console.log('🔧 Testing Enhanced Service Orders API...\n');

  try {
    // Test 1: Get enhanced service orders
    console.log('1. Testing GET /api/admin/service-orders/enhanced');
    const response1 = await fetch(`${API_BASE}/api/admin/service-orders/enhanced`);
    const data1 = await response1.json();
    console.log('Response status:', response1.status);
    console.log('Response data:', JSON.stringify(data1, null, 2));
    console.log('---\n');

    if (data1.success && data1.orders && data1.orders.length > 0) {
      const orderId = data1.orders[0]._id;
      
      // Test 2: Send message to order
      console.log('2. Testing POST /api/admin/service-orders/:id/messages');
      const messageData = {
        message: 'Hello! This is a test message from admin.',
        sender: 'admin',
        channel: 'userpage'
      };
      
      const response2 = await fetch(`${API_BASE}/api/admin/service-orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      const data2 = await response2.json();
      console.log('Message response status:', response2.status);
      console.log('Message response data:', JSON.stringify(data2, null, 2));
      console.log('---\n');

      // Test 3: Update price
      console.log('3. Testing PUT /api/admin/service-orders/:id/price/enhanced');
      const priceData = {
        newPrice: 1500,
        reason: 'Special discount for testing',
        changedBy: 'admin',
        discountType: 'percentage'
      };
      
      const response3 = await fetch(`${API_BASE}/api/admin/service-orders/${orderId}/price/enhanced`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priceData)
      });
      const data3 = await response3.json();
      console.log('Price update response status:', response3.status);
      console.log('Price update response data:', JSON.stringify(data3, null, 2));
      console.log('---\n');

      // Test 4: Get conversation
      console.log('4. Testing GET /api/admin/service-orders/:id/conversation');
      const response4 = await fetch(`${API_BASE}/api/admin/service-orders/${orderId}/conversation`);
      const data4 = await response4.json();
      console.log('Conversation response status:', response4.status);
      console.log('Conversation response data:', JSON.stringify(data4, null, 2));
      console.log('---\n');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run the test
testEnhancedAPI();
