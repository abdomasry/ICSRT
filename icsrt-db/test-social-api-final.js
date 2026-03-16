const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testSocialMediaAPI() {
  console.log('🧪 Testing Social Media API - Final Version');
  console.log('='.repeat(50));
  
  try {
    // Test GET /api/social-links
    console.log('\n1️⃣ Testing GET /api/social-links...');
    const getResponse = await axios.get(`${API_BASE}/api/social-links`);
    console.log('✅ GET Success:', getResponse.data.success);
    console.log('📊 Data count:', getResponse.data.data?.length || 0);
    
    if (getResponse.data.data && getResponse.data.data.length > 0) {
      const firstLink = getResponse.data.data[0];
      console.log('📋 First link:', {
        platform: firstLink.platform,
        url: firstLink.url,
        enabled: firstLink.enabled
      });
      
      // Test GET single link
      console.log('\n2️⃣ Testing GET single link...');
      const singleResponse = await axios.get(`${API_BASE}/api/social-links/${firstLink._id}`);
      console.log('✅ GET Single Success:', singleResponse.data.success);
    }
    
    // Test POST new link
    console.log('\n3️⃣ Testing POST new link...');
    const newLink = {
      platform: 'TikTok',
      url: 'https://tiktok.com/@icsrt',
      label: 'TikTok',
      enabled: true
    };
    
    const postResponse = await axios.post(`${API_BASE}/api/social-links`, newLink);
    console.log('✅ POST Success:', postResponse.data.success);
    const createdId = postResponse.data.data?._id;
    
    if (createdId) {
      // Test PUT update
      console.log('\n4️⃣ Testing PUT update...');
      const updateData = {
        url: 'https://tiktok.com/@icsrt_official',
        label: 'TikTok Official'
      };
      
      const putResponse = await axios.put(`${API_BASE}/api/social-links/${createdId}`, updateData);
      console.log('✅ PUT Success:', putResponse.data.success);
      
      // Test DELETE
      console.log('\n5️⃣ Testing DELETE...');
      const deleteResponse = await axios.delete(`${API_BASE}/api/social-links/${createdId}`);
      console.log('✅ DELETE Success:', deleteResponse.data.success);
    }
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API Test Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Test if server is running
async function checkServer() {
  try {
    const response = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start it first:');
    console.log('   cd icsrt-db && node server.js');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testSocialMediaAPI();
  }
}

main().catch(console.error);
