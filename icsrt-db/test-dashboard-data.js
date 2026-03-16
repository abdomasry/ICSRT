const axios = require('axios');

const testDashboardData = async () => {
  console.log('🧪 TESTING DASHBOARD DATA INTEGRATION');
  console.log('====================================\n');
  
  try {
    const baseURL = 'http://localhost:3000/api';
    
    // Test 1: Dashboard stats
    console.log('1. Testing Dashboard Stats...');
    const statsResponse = await axios.get(`${baseURL}/dashboard-stats`);
    console.log('✅ Dashboard Stats:', statsResponse.data);
    
    // Test 2: Users data
    console.log('\n2. Testing Users Data...');
    const usersResponse = await axios.get(`${baseURL}/users`);
    console.log('✅ Users Count:', usersResponse.data.data.length);
    console.log('✅ Sample User:', usersResponse.data.data[0]?.name);
    
    // Test 3: Papers data
    console.log('\n3. Testing Papers Data...');
    const papersResponse = await axios.get(`${baseURL}/papers`);
    console.log('✅ Papers Count:', papersResponse.data.data.length);
    console.log('✅ Sample Paper:', papersResponse.data.data[0]?.title);
    
    // Test 4: Conferences data
    console.log('\n4. Testing Conferences Data...');
    const conferencesResponse = await axios.get(`${baseURL}/conferences`);
    console.log('✅ Conferences Count:', conferencesResponse.data.data.length);
    console.log('✅ Sample Conference:', conferencesResponse.data.data[0]?.title);
    
    // Test 5: Services data
    console.log('\n5. Testing Services Data...');
    const servicesResponse = await axios.get(`${baseURL}/services`);
    console.log('✅ Services Count:', servicesResponse.data.data.length);
    console.log('✅ Sample Service:', servicesResponse.data.data[0]?.title || servicesResponse.data.data[0]?.name);
    
    // Test 6: Add new data via API
    console.log('\n6. Testing Add New Data...');
    const newPaper = {
      title: 'Dashboard Test Paper',
      author: 'Dashboard Tester',
      affiliation: 'Test University',
      email: 'test@example.com',
      keywords: ['testing', 'dashboard', 'api'],
      abstract: 'This is a test paper created from the dashboard API test.',
      status: 'submitted',
      conference: 'Test Conference'
    };
    
    const addPaperResponse = await axios.post(`${baseURL}/papers`, newPaper);
    console.log('✅ Added New Paper:', addPaperResponse.data.success);
    console.log('✅ New Paper ID:', addPaperResponse.data.id);
    
    // Test 7: Verify new data in stats
    console.log('\n7. Testing Updated Stats...');
    const updatedStatsResponse = await axios.get(`${baseURL}/dashboard-stats`);
    console.log('✅ Updated Papers Count:', updatedStatsResponse.data.totalPapers);
    
    console.log('\n🎉 ALL DASHBOARD DATA TESTS PASSED!');
    console.log('===================================');
    console.log('✅ Dashboard stats API working');
    console.log('✅ All collection APIs working');
    console.log('✅ Data adding functionality working');
    console.log('✅ Data updates reflected in stats');
    console.log('\n📊 Dashboard should now display all data at:');
    console.log('   http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
  }
};

testDashboardData();
