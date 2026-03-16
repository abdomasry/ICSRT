// =================================
// DEBUG SOCIAL MEDIA API TEST
// =================================
// Quick test to check social media API

const http = require('http');

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', err => reject(err));
    req.end();
  });
}

async function testSocialAPI() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🔍 Testing Social Media API...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    try {
      const response = await makeRequest(`${baseURL}/api/health`);
      if (response.status === 200) {
        console.log('✅ Server is running!');
        console.log('📊 Health response:', response.data);
      } else {
        console.log('⚠️ Server responded with status:', response.status);
      }
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      console.log('💡 Make sure the server is running: node server.js');
      return;
    }
    
    // Test 2: Social links endpoint
    console.log('\n2️⃣ Testing social links endpoint...');
    try {
      const response = await makeRequest(`${baseURL}/api/social-links`);
      
      if (response.status === 200) {
        console.log('✅ Social links API working!');
        console.log('📊 Response:', response.data);
      } else if (response.status === 404) {
        console.log('❌ Social links API returned 404');
        console.log('\n💡 404 Error indicates the endpoint is not found');
        console.log('🔧 This could mean:');
        console.log('   - The social media routes are not properly registered');
        console.log('   - The route path is incorrect');
        console.log('   - The server is not loading the social media module');
      } else {
        console.log('❌ Social links API failed with status:', response.status);
        console.log('Response:', response.data);
      }
    } catch (error) {
      console.log('❌ Social links API request failed:', error.message);
    }
    
    // Test 3: Check if the social media service can be loaded
    console.log('\n3️⃣ Testing social media service import...');
    try {
      const { SocialMediaService } = require('./social-media-service');
      console.log('✅ Social media service imported successfully');
      
      // Try to create a mock instance
      const mockDB = { collection: () => ({ find: () => ({ sort: () => ({ toArray: () => [] }) }) }) };
      const service = new SocialMediaService(mockDB);
      console.log('✅ Social media service instance created');
    } catch (error) {
      console.log('❌ Social media service import failed:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the test
testSocialAPI();
