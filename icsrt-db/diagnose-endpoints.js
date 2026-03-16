// Server Diagnostic Script
console.log('🔍 ICSRT Server Diagnostic Tool');
console.log('================================');

const http = require('http');
const https = require('https');

// Test if server is running
function testEndpoint(url, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body,
          success: res.statusCode < 400
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message,
        success: false
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runDiagnostics() {
  console.log('\n1️⃣ Testing server health...');
  const health = await testEndpoint('http://localhost:3000/api/health');
  console.log('Health check:', health.success ? '✅ SUCCESS' : '❌ FAILED');
  if (!health.success) {
    console.log('Error:', health.error || health.status);
    console.log('💡 Server might not be running. Try: node server.js');
    return;
  }

  console.log('\n2️⃣ Testing signup endpoint...');
  const signup = await testEndpoint('http://localhost:3000/api/auth/signup', 'POST', {
    fullName: 'Test User',
    email: 'test@test.com',
    password: 'test123'
  });
  console.log('Signup test:', signup.success ? '✅ SUCCESS' : '❌ FAILED');
  if (!signup.success) {
    console.log('Error:', signup.error || signup.status);
    console.log('Response:', signup.body?.substring(0, 200));
  }

  console.log('\n3️⃣ Testing login endpoint...');
  const login = await testEndpoint('http://localhost:3000/api/auth/login', 'POST', {
    email: 'superadmin@icsrt.com',
    password: 'superadmin'
  });
  console.log('Login test:', login.success ? '✅ SUCCESS' : '❌ FAILED');
  if (!login.success) {
    console.log('Error:', login.error || login.status);
    console.log('Response:', login.body?.substring(0, 200));
  }

  console.log('\n4️⃣ Testing change password endpoint...');
  const changePassword = await testEndpoint('http://localhost:3000/api/auth/change-password', 'POST', {
    email: 'test@test.com',
    currentPassword: 'old',
    newPassword: 'new123'
  });
  console.log('Change password test:', changePassword.success ? '✅ SUCCESS' : '❌ FAILED');
  if (!changePassword.success) {
    console.log('Error:', changePassword.error || changePassword.status);
  }

  console.log('\n📋 Diagnosis complete!');
  console.log('\n💡 If any tests failed:');
  console.log('   1. Make sure server is running: node server.js');
  console.log('   2. Check for error messages in server console');
  console.log('   3. Verify port 3000 is not blocked');
  console.log('   4. Check CORS configuration');
}

runDiagnostics();
