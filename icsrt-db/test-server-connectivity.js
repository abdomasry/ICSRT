const http = require('http');

console.log('🧪 Testing ICSRT Backend Server connectivity...');

// Test 1: Basic server connectivity
const testServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/test', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Server is running and accessible');
          try {
            const parsed = JSON.parse(data);
            console.log('📦 Response:', parsed);
            resolve(true);
          } catch (e) {
            console.log('📦 Response (raw):', data);
            resolve(true);
          }
        } else {
          console.log(`❌ Server returned status: ${res.statusCode}`);
          console.log('📦 Response:', data);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Cannot connect to server:', error.message);
      console.log('💡 Make sure the server is running on port 3000');
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

// Test 2: Social Links API
const testSocialLinksAPI = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/api/social-links', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Social Links API is working');
          try {
            const parsed = JSON.parse(data);
            console.log(`📊 Found ${parsed.data?.length || 0} social links`);
            resolve(true);
          } catch (e) {
            console.log('📦 Response (raw):', data);
            resolve(true);
          }
        } else {
          console.log(`❌ Social Links API returned status: ${res.statusCode}`);
          console.log('📦 Response:', data);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Social Links API error:', error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Social Links API timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

// Run tests
async function runTests() {
  try {
    console.log('\n1️⃣ Testing server connectivity...');
    await testServer();
    
    console.log('\n2️⃣ Testing Social Links API...');
    await testSocialLinksAPI();
    
    console.log('\n🎉 All tests passed! The server is working correctly.');
    console.log('💡 You can now use the Social Media Management in the dashboard.');
    
  } catch (error) {
    console.log('\n💥 Tests failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure the server is running: node server.js');
    console.log('2. Check if port 3000 is available');
    console.log('3. Verify no firewall is blocking the connection');
  }
}

runTests();
