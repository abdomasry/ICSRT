// Test script to verify user dashboard endpoints
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';
const testEmail = 'demo@icsrt.com';

async function testEndpoints() {
  console.log('🧪 Testing User Dashboard Endpoints...\n');

  try {
    // Test user stats endpoint
    console.log('1. Testing /api/user/stats...');
    const statsResponse = await fetch(`${API_BASE_URL}/api/user/stats?userEmail=${encodeURIComponent(testEmail)}`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Stats endpoint working:', stats);
    } else {
      console.log('❌ Stats endpoint failed:', statsResponse.status);
    }

    // Test user service orders endpoint
    console.log('\n2. Testing /api/user/service-orders...');
    const ordersResponse = await fetch(`${API_BASE_URL}/api/user/service-orders?userEmail=${encodeURIComponent(testEmail)}`);
    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      console.log('✅ Service orders endpoint working, found:', orders.length, 'orders');
    } else {
      console.log('❌ Service orders endpoint failed:', ordersResponse.status);
    }

    // Test user tickets endpoint
    console.log('\n3. Testing /api/user/tickets...');
    const ticketsResponse = await fetch(`${API_BASE_URL}/api/user/tickets?userEmail=${encodeURIComponent(testEmail)}`);
    if (ticketsResponse.ok) {
      const tickets = await ticketsResponse.json();
      console.log('✅ Tickets endpoint working, found:', tickets.length, 'tickets');
    } else {
      console.log('❌ Tickets endpoint failed:', ticketsResponse.status);
    }

    // Test articles endpoint (for homepage)
    console.log('\n4. Testing /api/articles/featured...');
    const articlesResponse = await fetch(`${API_BASE_URL}/api/articles/featured`);
    if (articlesResponse.ok) {
      const articles = await articlesResponse.json();
      console.log('✅ Articles endpoint working, found:', articles.data?.length || 0, 'featured articles');
    } else {
      console.log('❌ Articles endpoint failed:', articlesResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n🔧 Make sure the server is running with: node server.js');
  }

  console.log('\n✨ Endpoint testing complete!');
}

// Run the test
testEndpoints();
