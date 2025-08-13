const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function quickEndpointTest() {
  console.log('🔍 Quick Endpoint Test for Resolve/Close functionality\n');
  
  try {
    // Test 1: Check if server is responding
    console.log('1. Testing server connectivity...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      console.log('✅ Server is responding');
      console.log(`   Status: ${response.status}`);
      console.log(`   Data: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('   Server is not running! Please start the server first.\n');
        return;
      }
      console.log('');
    }

    // Test 2: Get tickets to test with
    console.log('2. Getting available tickets...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tickets`);
      console.log('✅ Tickets endpoint accessible');
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const tickets = response.data.data;
        console.log(`   Found ${tickets.length} tickets`);
        
        // Find a suitable ticket for testing
        const testTicket = tickets.find(t => t.status !== 'closed') || tickets[0];
        console.log(`   Using ticket: ${testTicket.ticketNumber} (Status: ${testTicket.status})\n`);
        
        // Test 3: Try resolving the ticket
        console.log('3. Testing RESOLVE endpoint...');
        try {
          const resolveResponse = await axios.patch(`${API_BASE_URL}/api/tickets/${testTicket._id}/resolve`, {
            resolvedBy: 'Test Admin',
            resolutionMessage: 'Testing resolve endpoint'
          });
          console.log('✅ Resolve endpoint working');
          console.log(`   Response: ${JSON.stringify(resolveResponse.data, null, 2)}\n`);
        } catch (error) {
          console.log('❌ Resolve endpoint failed:', error.message);
          if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Error Data: ${JSON.stringify(error.response.data, null, 2)}`);
          }
          console.log('');
        }

        // Test 4: Try closing a ticket (use a different one if available)
        console.log('4. Testing CLOSE endpoint...');
        const closeTicket = tickets.find(t => t.status !== 'closed' && t._id !== testTicket._id) || testTicket;
        try {
          const closeResponse = await axios.patch(`${API_BASE_URL}/api/tickets/${closeTicket._id}/close`, {
            closedBy: 'Test Admin',
            closeReason: 'Testing close endpoint'
          });
          console.log('✅ Close endpoint working');
          console.log(`   Response: ${JSON.stringify(closeResponse.data, null, 2)}\n`);
        } catch (error) {
          console.log('❌ Close endpoint failed:', error.message);
          if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Error Data: ${JSON.stringify(error.response.data, null, 2)}`);
          }
          console.log('');
        }
        
      } else {
        console.log('   No tickets available for testing\n');
      }
    } catch (error) {
      console.log('❌ Failed to get tickets:', error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      console.log('');
    }

  } catch (error) {
    console.log('❌ General error during testing:', error.message);
  }
}

// Run the test
console.log('Starting quick endpoint test...\n');
quickEndpointTest().catch(console.error);
