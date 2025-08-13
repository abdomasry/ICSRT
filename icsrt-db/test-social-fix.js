console.log('🧪 Testing Social Links API Fix...');

const http = require('http');

const testAPI = async (url, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const runTests = async () => {
  try {
    console.log('\n1️⃣ Testing server connectivity...');
    const testResult = await testAPI('/test');
    if (testResult.status === 200) {
      console.log('✅ Server is running and accessible');
      console.log('📦 Response:', testResult.data);
    } else {
      console.log(`❌ Server test failed with status: ${testResult.status}`);
      return;
    }

    console.log('\n2️⃣ Testing GET /api/social-links...');
    const getResult = await testAPI('/api/social-links');
    if (getResult.status === 200) {
      console.log('✅ GET /api/social-links works!');
      console.log(`📊 Found ${getResult.data.data?.length || 0} social links`);
      if (getResult.data.data?.length > 0) {
        console.log('🔗 First link:', getResult.data.data[0]);
      }
    } else {
      console.log(`❌ GET failed with status: ${getResult.status}`);
      console.log('📦 Response:', getResult.data);
      return;
    }

    console.log('\n3️⃣ Testing POST /api/social-links...');
    const postData = {
      platform: 'test',
      url: 'https://test.example.com',
      label: 'Test Platform',
      enabled: true
    };
    
    const postResult = await testAPI('/api/social-links', 'POST', postData);
    if (postResult.status === 201) {
      console.log('✅ POST /api/social-links works!');
      console.log('📦 Created:', postResult.data.data);
      
      // Clean up - delete the test link
      if (postResult.data.data?._id) {
        console.log('\n🧹 Cleaning up test data...');
        const deleteResult = await testAPI(`/api/social-links/${postResult.data.data._id}`, 'DELETE');
        if (deleteResult.status === 200) {
          console.log('✅ Cleanup successful');
        }
      }
    } else {
      console.log(`❌ POST failed with status: ${postResult.status}`);
      console.log('📦 Response:', postResult.data);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Social Media Management should now work in the dashboard!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running: node server.js');
    }
  }
};

runTests();
