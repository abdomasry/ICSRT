// Test script for contact requests functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testContactRequests() {
  try {
    console.log('🧪 Testing Contact Requests functionality...\n');
    
    // 1. Get all contact requests
    console.log('1. Fetching all contact requests...');
    const response = await axios.get(`${BASE_URL}/api/contact-requests`);
    console.log(`✅ Found ${response.data.length} contact requests`);
    
    if (response.data.length > 0) {
      const firstContact = response.data[0];
      console.log(`📋 First contact: ${firstContact.name} (${firstContact.email})`);
      console.log(`🆔 ID: ${firstContact._id}`);
      
      // 2. Test delete debug endpoint
      console.log('\n2. Testing delete debug endpoint...');
      const debugResponse = await axios.get(`${BASE_URL}/api/contact-requests/${firstContact._id}/test-delete`);
      console.log('🔍 Debug result:', JSON.stringify(debugResponse.data, null, 2));
      
      // 3. Test WhatsApp chat URL generation
      if (firstContact.phone) {
        console.log('\n3. Testing WhatsApp chat URL generation...');
        const whatsappResponse = await axios.get(`${BASE_URL}/api/contact-requests/${firstContact._id}/whatsapp-chat`);
        console.log('📱 WhatsApp URLs:', whatsappResponse.data.whatsappUrls);
        console.log('🔗 Direct chat URL:', whatsappResponse.data.directChatUrl);
      } else {
        console.log('\n3. ⚠️ First contact has no phone number, skipping WhatsApp test');
      }
    } else {
      console.log('❌ No contact requests found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testContactRequests();
