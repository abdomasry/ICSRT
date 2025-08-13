// ===============================
// COMPLETE SOCIAL MEDIA SYSTEM TEST
// ===============================
// Tests the entire rebuilt system from database to userpage
// Date: August 3, 2025

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

console.log('🧪 COMPLETE SOCIAL MEDIA SYSTEM TEST');
console.log('=' .repeat(60));

async function testCompleteSystem() {
  let testResults = {
    serverConnection: false,
    databaseRead: false,
    databaseWrite: false,
    databaseUpdate: false,
    databaseDelete: false,
    apiEndpoints: false
  };

  try {
    // Test 1: Server Connection
    console.log('\n🔌 Test 1: Server Connection');
    try {
      const healthResponse = await axios.get(`${API_BASE}/api/health`);
      console.log('✅ Server is running and responding');
      testResults.serverConnection = true;
    } catch (error) {
      console.log('❌ Server connection failed');
      console.log('💡 Please start the server: cd icsrt-db && node server.js');
      return testResults;
    }

    // Test 2: Database Read (GET all social links)
    console.log('\n📖 Test 2: Database Read (GET /api/social-links)');
    try {
      const getResponse = await axios.get(`${API_BASE}/api/social-links`);
      
      if (getResponse.data.success) {
        console.log('✅ Successfully read social media links');
        console.log(`📊 Found ${getResponse.data.data.length} social links`);
        testResults.databaseRead = true;
        
        // Display current links
        getResponse.data.data.forEach((link, index) => {
          console.log(`   ${index + 1}. ${link.label || link.platform} - ${link.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        });
      } else {
        console.log('❌ Failed to read social links:', getResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Database read failed:', error.message);
    }

    // Test 3: Database Write (POST new social link)
    console.log('\n✍️ Test 3: Database Write (POST /api/social-links)');
    let testLinkId = null;
    try {
      const testLink = {
        platform: 'github',
        url: 'https://github.com/icsrt-test',
        label: 'Test GitHub',
        enabled: true
      };

      const postResponse = await axios.post(`${API_BASE}/api/social-links`, testLink);
      
      if (postResponse.data.success) {
        testLinkId = postResponse.data.data._id;
        console.log('✅ Successfully created test social link');
        console.log(`🆔 Created link ID: ${testLinkId}`);
        testResults.databaseWrite = true;
      } else {
        console.log('❌ Failed to create social link:', postResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Database write failed:', error.message);
    }

    // Test 4: Database Update (PUT social link)
    if (testLinkId) {
      console.log('\n🔄 Test 4: Database Update (PUT /api/social-links/:id)');
      try {
        const updateData = {
          label: 'Updated Test GitHub',
          url: 'https://github.com/icsrt-updated'
        };

        const putResponse = await axios.put(`${API_BASE}/api/social-links/${testLinkId}`, updateData);
        
        if (putResponse.data.success) {
          console.log('✅ Successfully updated test social link');
          testResults.databaseUpdate = true;
        } else {
          console.log('❌ Failed to update social link:', putResponse.data.error);
        }
      } catch (error) {
        console.log('❌ Database update failed:', error.message);
      }
    }

    // Test 5: Database Delete (DELETE social link)
    if (testLinkId) {
      console.log('\n🗑️ Test 5: Database Delete (DELETE /api/social-links/:id)');
      try {
        const deleteResponse = await axios.delete(`${API_BASE}/api/social-links/${testLinkId}`);
        
        if (deleteResponse.data.success) {
          console.log('✅ Successfully deleted test social link');
          testResults.databaseDelete = true;
        } else {
          console.log('❌ Failed to delete social link:', deleteResponse.data.error);
        }
      } catch (error) {
        console.log('❌ Database delete failed:', error.message);
      }
    }

    // Test 6: All API Endpoints
    console.log('\n🎯 Test 6: API Endpoints Status');
    const endpoints = [
      'GET /api/social-links',
      'POST /api/social-links', 
      'PUT /api/social-links/:id',
      'DELETE /api/social-links/:id'
    ];

    const workingEndpoints = [
      testResults.databaseRead,
      testResults.databaseWrite,
      testResults.databaseUpdate,
      testResults.databaseDelete
    ];

    endpoints.forEach((endpoint, index) => {
      const status = workingEndpoints[index] ? '✅' : '❌';
      console.log(`   ${status} ${endpoint}`);
    });

    const allEndpointsWorking = workingEndpoints.every(Boolean);
    testResults.apiEndpoints = allEndpointsWorking;

    if (allEndpointsWorking) {
      console.log('✅ All API endpoints are working correctly');
    } else {
      console.log('⚠️ Some API endpoints have issues');
    }

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error.message);
  }

  return testResults;
}

async function generateTestReport(results) {
  console.log('\n' + '=' .repeat(60));
  console.log('📋 FINAL TEST REPORT');
  console.log('=' .repeat(60));

  const tests = [
    { name: 'Server Connection', status: results.serverConnection, importance: 'CRITICAL' },
    { name: 'Database Read', status: results.databaseRead, importance: 'CRITICAL' },
    { name: 'Database Write', status: results.databaseWrite, importance: 'CRITICAL' },
    { name: 'Database Update', status: results.databaseUpdate, importance: 'HIGH' },
    { name: 'Database Delete', status: results.databaseDelete, importance: 'HIGH' },
    { name: 'API Endpoints', status: results.apiEndpoints, importance: 'CRITICAL' }
  ];

  tests.forEach(test => {
    const status = test.status ? '✅ PASS' : '❌ FAIL';
    const importance = test.importance;
    console.log(`${status} | ${test.name.padEnd(20)} | ${importance}`);
  });

  const totalTests = tests.length;
  const passedTests = tests.filter(test => test.status).length;
  const successRate = Math.round((passedTests / totalTests) * 100);

  console.log('\n📊 SUMMARY:');
  console.log(`   Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${successRate}%`);

  if (successRate === 100) {
    console.log('\n🎉 EXCELLENT! All tests passed. Social media system is fully functional.');
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Start dashboard: cd icsrt-dashboard && npm start');
    console.log('   2. Go to Social Media Management page');
    console.log('   3. Test CRUD operations in the UI');
    console.log('   4. Check user page footer displays social links');
  } else if (successRate >= 75) {
    console.log('\n⚠️ GOOD: Most tests passed, but some issues remain.');
    console.log('💡 Review failed tests and check server logs.');
  } else {
    console.log('\n🚨 CRITICAL: Major issues detected.');
    console.log('💡 Please check:');
    console.log('   - Server is running (node server.js)');
    console.log('   - MongoDB connection is working');
    console.log('   - No port conflicts on 3000');
  }

  return successRate;
}

// Main execution
async function main() {
  console.log('⏱️ Starting comprehensive system test...\n');
  
  const startTime = Date.now();
  const results = await testCompleteSystem();
  const endTime = Date.now();
  
  console.log(`\n⏱️ Test completed in ${endTime - startTime}ms`);
  
  const successRate = await generateTestReport(results);
  
  process.exit(successRate === 100 ? 0 : 1);
}

// Handle unhandled errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled promise rejection:', error.message);
  process.exit(1);
});

main().catch(console.error);
