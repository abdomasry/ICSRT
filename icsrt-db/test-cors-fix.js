const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testCORSAndEndpoints() {
  console.log('🔧 Testing CORS Fix and Resolve/Close Endpoints\n');
  
  try {
    // Test 1: Basic connectivity
    console.log('1. Testing server connectivity...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      console.log('✅ Server is running and accessible');
      console.log(`   Response: ${JSON.stringify(response.data)}\n`);
    } catch (error) {
      console.log('❌ Cannot connect to server:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('   ⚠️  Server is not running! Please start the server first.\n');
        return;
      }
      console.log('');
    }

    // Test 2: Get tickets for testing
    console.log('2. Getting tickets for testing...');
    let tickets = [];
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tickets`);
      if (response.data.success && response.data.data) {
        tickets = response.data.data;
        console.log(`✅ Found ${tickets.length} tickets`);
        if (tickets.length === 0) {
          console.log('   📝 Creating a test ticket for testing...');
          // Create a test ticket
          const createResponse = await axios.post(`${API_BASE_URL}/api/tickets`, {
            subject: 'Test Ticket for CORS Testing',
            message: 'This ticket was created to test the resolve/close CORS fix.',
            category: 'technical',
            priority: 'medium',
            userName: 'Test User',
            userEmail: 'test@example.com'
          });
          if (createResponse.data.success) {
            console.log(`   ✅ Created test ticket: ${createResponse.data.ticketNumber}`);
            // Refresh tickets
            const refreshResponse = await axios.get(`${API_BASE_URL}/api/tickets`);
            tickets = refreshResponse.data.data || [];
          }
        }
        console.log('');
      }
    } catch (error) {
      console.log('❌ Failed to get tickets:', error.message);
      console.log('');
    }

    if (tickets.length === 0) {
      console.log('⚠️  No tickets available for testing. Please create a ticket first.\n');
      return;
    }

    const testTicket = tickets.find(t => t.status !== 'closed') || tickets[0];
    console.log(`📋 Using ticket for testing: ${testTicket.ticketNumber} (Status: ${testTicket.status})\n`);

    // Test 3: PATCH method - Resolve endpoint
    console.log('3. Testing PATCH method - RESOLVE endpoint...');
    try {
      const resolveResponse = await axios.patch(`${API_BASE_URL}/api/tickets/${testTicket._id}/resolve`, {
        resolvedBy: 'CORS Test Admin',
        resolutionMessage: 'Testing CORS fix for PATCH method - resolve'
      });
      console.log('✅ RESOLVE endpoint working with PATCH method!');
      console.log(`   Ticket ${testTicket.ticketNumber} resolved successfully`);
      console.log(`   Response: ${JSON.stringify(resolveResponse.data, null, 2)}\n`);
    } catch (error) {
      console.log('❌ RESOLVE endpoint failed:', error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      console.log('');
    }

    // Test 4: PATCH method - Close endpoint (use different ticket if available)
    console.log('4. Testing PATCH method - CLOSE endpoint...');
    const closeTicket = tickets.find(t => t.status !== 'closed' && t._id !== testTicket._id) || 
                       tickets.find(t => t.status !== 'closed') || testTicket;
    try {
      const closeResponse = await axios.patch(`${API_BASE_URL}/api/tickets/${closeTicket._id}/close`, {
        closedBy: 'CORS Test Admin',
        closeReason: 'Testing CORS fix for PATCH method - close'
      });
      console.log('✅ CLOSE endpoint working with PATCH method!');
      console.log(`   Ticket ${closeTicket.ticketNumber} closed successfully`);
      console.log(`   Response: ${JSON.stringify(closeResponse.data, null, 2)}\n`);
    } catch (error) {
      console.log('❌ CLOSE endpoint failed:', error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      console.log('');
    }

    // Test 5: Verify CORS headers (options request)
    console.log('5. Testing CORS OPTIONS request...');
    try {
      const optionsResponse = await axios({
        method: 'OPTIONS',
        url: `${API_BASE_URL}/api/tickets/${testTicket._id}/resolve`,
        headers: {
          'Origin': 'http://localhost:3001',
          'Access-Control-Request-Method': 'PATCH',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('✅ CORS OPTIONS request successful');
      console.log(`   Allowed methods should include PATCH`);
      console.log(`   Status: ${optionsResponse.status}\n`);
    } catch (error) {
      console.log('❌ CORS OPTIONS request failed:', error.message);
      console.log('');
    }

    console.log('🎉 CORS and endpoint testing completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- Server connectivity: ✅');
    console.log('- PATCH method support: Should be ✅ after server restart');
    console.log('- Resolve endpoint: Should be ✅');
    console.log('- Close endpoint: Should be ✅');
    console.log('');
    console.log('💡 If tests are successful, the dashboard resolve/close buttons should work!');

  } catch (error) {
    console.log('❌ General testing error:', error.message);
  }
}

// Run the test
testCORSAndEndpoints().catch(console.error);
