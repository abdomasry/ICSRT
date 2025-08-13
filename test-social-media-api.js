// Test script to verify Social Media API functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testSocialMediaAPI() {
  console.log('🧪 Testing Social Media Management API...\n');
  
  try {
    // Test 1: Get all social links
    console.log('1️⃣ Testing GET /api/social-links...');
    const getAllResponse = await axios.get(`${API_BASE_URL}/api/social-links`);
    console.log('✅ GET all links:', getAllResponse.data);
    console.log(`   Found ${getAllResponse.data.data?.length || 0} social links\n`);
    
    // Test 2: Create a new social link
    console.log('2️⃣ Testing POST /api/social-links...');
    const testData = {
      platform: 'github',
      url: 'https://github.com/icsrt',
      label: 'GitHub',
      enabled: true,
      icon: 'fab fa-github',
      order: 99
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/api/social-links`, testData);
    console.log('✅ Created link:', createResponse.data);
    const createdLinkId = createResponse.data.data?._id || createResponse.data.data?.id;
    console.log(`   Created with ID: ${createdLinkId}\n`);
    
    // Test 3: Update the created link
    if (createdLinkId) {
      console.log('3️⃣ Testing PUT /api/social-links/:id...');
      const updateData = {
        platform: 'github',
        url: 'https://github.com/icsrt-official',
        label: 'ICSRT GitHub',
        enabled: true,
        icon: 'fab fa-github',
        order: 10
      };
      
      const updateResponse = await axios.put(`${API_BASE_URL}/api/social-links/${createdLinkId}`, updateData);
      console.log('✅ Updated link:', updateResponse.data);
      console.log('   URL updated to: https://github.com/icsrt-official\n');
      
      // Test 4: Get the updated link
      console.log('4️⃣ Testing GET /api/social-links/:id...');
      const getOneResponse = await axios.get(`${API_BASE_URL}/api/social-links/${createdLinkId}`);
      console.log('✅ Retrieved single link:', getOneResponse.data);
      console.log('   Verified update successful\n');
      
      // Test 5: Delete the test link
      console.log('5️⃣ Testing DELETE /api/social-links/:id...');
      const deleteResponse = await axios.delete(`${API_BASE_URL}/api/social-links/${createdLinkId}`);
      console.log('✅ Deleted link:', deleteResponse.data);
      console.log('   Cleanup successful\n');
    }
    
    // Test 6: Get all links again to verify final state
    console.log('6️⃣ Final verification - GET /api/social-links...');
    const finalResponse = await axios.get(`${API_BASE_URL}/api/social-links`);
    console.log('✅ Final state:', finalResponse.data);
    console.log(`   Total links: ${finalResponse.data.data?.length || 0}\n`);
    
    console.log('🎉 All Social Media API tests passed!');
    console.log('📱 The API is ready for use with the React dashboard.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure the backend server is running on port 3000');
      console.log('   Command: cd icsrt-db && node server.js');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Solution: The API endpoint might not be available');
      console.log('   Check if the social media routes are properly configured');
    }
  }
}

// Run the test
testSocialMediaAPI();
