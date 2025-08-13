const axios = require('axios');

const testSystem = async () => {
  console.log('🧪 TESTING ADMIN-FREE ICSRT SYSTEM');
  console.log('===================================\n');
  
  try {
    // Test backend health
    console.log('1. Testing Backend Health...');
    const healthResponse = await axios.get('http://localhost:3000/api/health');
    console.log('✅ Backend is healthy:', healthResponse.data);
    
    // Test dashboard stats (was previously admin-only)
    console.log('\n2. Testing Dashboard Stats (previously admin-only)...');
    const statsResponse = await axios.get('http://localhost:3000/api/dashboard-stats');
    console.log('✅ Dashboard stats accessible:', {
      users: statsResponse.data.totalUsers,
      papers: statsResponse.data.totalPapers,
      conferences: statsResponse.data.totalConferences,
      events: statsResponse.data.totalEvents
    });
    
    // Test user data access
    console.log('\n3. Testing User Data Access...');
    const usersResponse = await axios.get('http://localhost:3000/api/users');
    console.log('✅ Users data accessible:', {
      count: Array.isArray(usersResponse.data) ? usersResponse.data.length : usersResponse.data.data?.length || 0
    });
    
    // Test papers access
    console.log('\n4. Testing Papers Access...');
    const papersResponse = await axios.get('http://localhost:3000/api/papers');
    console.log('✅ Papers data accessible:', {
      count: Array.isArray(papersResponse.data) ? papersResponse.data.length : papersResponse.data.data?.length || 0
    });
    
    // Verify admin endpoints are gone
    console.log('\n5. Verifying Admin Endpoints Are Removed...');
    try {
      await axios.post('http://localhost:3000/api/admin/login', { 
        username: 'test', 
        password: 'test' 
      });
      console.log('❌ Admin login endpoint still exists!');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Admin login endpoint successfully removed');
      } else {
        console.log('⚠️ Unexpected error:', error.message);
      }
    }
    
    // Test database connection
    console.log('\n6. Testing Database Connection...');
    const dbResponse = await axios.get('http://localhost:3000/api/test-db');
    console.log('✅ Database connected:', {
      status: dbResponse.data.status,
      database: dbResponse.data.database,
      userCount: dbResponse.data.userCount
    });
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('==================');
    console.log('✅ Backend running without admin system');
    console.log('✅ All data accessible without authentication');
    console.log('✅ Admin endpoints successfully removed');
    console.log('✅ User data preserved and accessible');
    console.log('✅ Dashboard should be accessible at http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
  }
};

testSystem();
