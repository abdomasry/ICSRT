const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testTicketEndpoints() {
  console.log('🎫 Testing Ticket System Endpoints...\n');
  
  try {
    // Test 1: Get all tickets
    console.log('1. Testing GET /api/tickets...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tickets`);
      console.log('✅ Tickets endpoint working');
      console.log(`   Found ${response.data.count || 0} tickets`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (error) {
      console.log('❌ Tickets endpoint failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      console.log('');
    }

    // Test 2: Get contact requests to test conversion
    console.log('2. Testing GET /api/contact-requests...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/contact-requests`);
      console.log('✅ Contact requests endpoint working');
      console.log(`   Found ${response.data.length || response.data.data?.length || 0} contact requests`);
      
      if (response.data.length > 0 || (response.data.data && response.data.data.length > 0)) {
        const contacts = response.data.length ? response.data : response.data.data;
        const firstContact = contacts[0];
        console.log(`   First contact: ${firstContact.name} - ${firstContact.subject}`);
        
        // Test 3: Try converting first contact to ticket
        console.log('\n3. Testing contact-to-ticket conversion...');
        try {
          const convertResponse = await axios.post(`${API_BASE_URL}/api/contact-requests/${firstContact._id}/convert-to-ticket`);
          console.log('✅ Contact-to-ticket conversion working');
          console.log(`   Created ticket: ${convertResponse.data.ticketNumber}`);
          console.log(`   Response: ${JSON.stringify(convertResponse.data, null, 2)}\n`);
        } catch (convertError) {
          console.log('❌ Contact-to-ticket conversion failed:', convertError.message);
          if (convertError.response) {
            console.log('   Status:', convertError.response.status);
            console.log('   Data:', convertError.response.data);
          }
          console.log('');
        }
      } else {
        console.log('   No contact requests found to test conversion\n');
      }
    } catch (error) {
      console.log('❌ Contact requests endpoint failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      console.log('');
    }

    // Test 4: Create a test ticket directly
    console.log('4. Testing POST /api/tickets (direct ticket creation)...');
    try {
      const testTicket = {
        subject: 'Test Ticket from Script',
        message: 'This is a test ticket created to verify the API endpoints.',
        category: 'technical',
        priority: 'medium',
        userName: 'Test User',
        userEmail: 'test@example.com'
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/tickets`, testTicket);
      console.log('✅ Direct ticket creation working');
      console.log(`   Created ticket: ${response.data.ticketNumber}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (error) {
      console.log('❌ Direct ticket creation failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      console.log('');
    }

    // Test 5: Test resolve ticket endpoint
    console.log('5. Testing PATCH /api/tickets/:id/resolve...');
    try {
      // First get tickets to find one to resolve
      const ticketsResponse = await axios.get(`${API_BASE_URL}/api/tickets`);
      if (ticketsResponse.data.data && ticketsResponse.data.data.length > 0) {
        const testTicket = ticketsResponse.data.data.find(t => t.status !== 'closed' && t.status !== 'resolved') || ticketsResponse.data.data[0];
        
        const response = await axios.patch(`${API_BASE_URL}/api/tickets/${testTicket._id}/resolve`, {
          resolvedBy: 'Test Admin',
          resolutionMessage: 'Test resolution message'
        });
        console.log('✅ Resolve ticket endpoint working');
        console.log(`   Resolved ticket: ${testTicket.ticketNumber}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
      } else {
        console.log('   No tickets available to test resolve functionality\n');
      }
    } catch (error) {
      console.log('❌ Resolve ticket endpoint failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      console.log('');
    }

    // Test 6: Test close ticket endpoint
    console.log('6. Testing PATCH /api/tickets/:id/close...');
    try {
      // First get tickets to find one to close
      const ticketsResponse = await axios.get(`${API_BASE_URL}/api/tickets`);
      if (ticketsResponse.data.data && ticketsResponse.data.data.length > 0) {
        const testTicket = ticketsResponse.data.data.find(t => t.status !== 'closed') || ticketsResponse.data.data[0];
        
        const response = await axios.patch(`${API_BASE_URL}/api/tickets/${testTicket._id}/close`, {
          closedBy: 'Test Admin',
          closeReason: 'Test closure reason'
        });
        console.log('✅ Close ticket endpoint working');
        console.log(`   Closed ticket: ${testTicket.ticketNumber}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
      } else {
        console.log('   No tickets available to test close functionality\n');
      }
    } catch (error) {
      console.log('❌ Close ticket endpoint failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      console.log('');
    }

    // Test 7: Test user reply endpoint
    console.log('7. Testing POST /api/tickets/:id/user-reply...');
    try {
      // First get tickets to find one to reply to
      const ticketsResponse = await axios.get(`${API_BASE_URL}/api/tickets`);
      if (ticketsResponse.data.data && ticketsResponse.data.data.length > 0) {
        const testTicket = ticketsResponse.data.data.find(t => t.status !== 'closed') || ticketsResponse.data.data[0];
        
        const response = await axios.post(`${API_BASE_URL}/api/tickets/${testTicket._id}/user-reply`, {
          message: 'This is a test user reply to the ticket.',
          userEmail: testTicket.userEmail || 'test@example.com',
          userName: testTicket.userName || 'Test User'
        });
        console.log('✅ User reply endpoint working');
        console.log(`   Added reply to ticket: ${testTicket.ticketNumber}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
      } else {
        console.log('   No tickets available to test user reply functionality\n');
      }
    } catch (error) {
      console.log('❌ User reply endpoint failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      console.log('');
    }

    // Test 8: Check if server is responding to basic health check
    console.log('8. Testing server health...');
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Server health endpoint working');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (error) {
      console.log('❌ Server health endpoint failed or not available');
      console.log('   This is expected if no health endpoint exists\n');
    }

  } catch (error) {
    console.log('❌ General error during testing:', error.message);
  }
}

// Run the tests
testTicketEndpoints().catch(console.error);
