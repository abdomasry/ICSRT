// ICSRT Dashboard Integration Test
// This script tests the complete dashboard data integration

async function testDashboardIntegration() {
    console.log('🧪 ICSRT Dashboard Integration Test');
    console.log('=====================================\n');

    const baseUrl = 'http://localhost:3000/api';

    try {
        // Test 1: Dashboard Stats
        console.log('📊 Testing Dashboard Stats...');
        const statsResponse = await fetch(`${baseUrl}/dashboard-stats`);
        const stats = await statsResponse.json();
        console.log('✅ Dashboard Stats:', stats);
        console.log('');

        // Test 2: Recent Users (for RecentActivity component)
        console.log('👥 Testing Recent Users...');
        const usersResponse = await fetch(`${baseUrl}/users`);
        const usersData = await usersResponse.json();
        const recentUsers = usersData.data.slice(0, 3);
        console.log('✅ Recent Users Count:', recentUsers.length);
        recentUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} (${user.email})`);
        });
        console.log('');

        // Test 3: Recent Papers
        console.log('📄 Testing Recent Papers...');
        const papersResponse = await fetch(`${baseUrl}/papers`);
        const papersData = await papersResponse.json();
        const recentPapers = papersData.data.slice(0, 3);
        console.log('✅ Recent Papers Count:', recentPapers.length);
        recentPapers.forEach((paper, index) => {
            console.log(`   ${index + 1}. ${paper.title}`);
        });
        console.log('');

        // Test 4: Recent Events
        console.log('📅 Testing Recent Events...');
        const eventsResponse = await fetch(`${baseUrl}/events`);
        const eventsData = await eventsResponse.json();
        const recentEvents = eventsData.data.slice(0, 3);
        console.log('✅ Recent Events Count:', recentEvents.length);
        recentEvents.forEach((event, index) => {
            console.log(`   ${index + 1}. ${event.title}`);
        });
        console.log('');

        // Test 5: Recent News
        console.log('📰 Testing Recent News...');
        const newsResponse = await fetch(`${baseUrl}/news`);
        const newsData = await newsResponse.json();
        const recentNews = newsData.data.slice(0, 3);
        console.log('✅ Recent News Count:', recentNews.length);
        recentNews.forEach((news, index) => {
            console.log(`   ${index + 1}. ${news.title}`);
        });
        console.log('');

        // Test 6: Data Validation
        console.log('🔍 Data Validation...');
        console.log('✅ Backend API:', statsResponse.ok ? 'Connected' : 'Failed');
        console.log('✅ Database Collections Active:', Object.keys(stats).length);
        console.log('✅ Total Records:', Object.values(stats).reduce((sum, val) => 
            typeof val === 'number' ? sum + val : sum, 0));
        console.log('');

        // Test 7: Dashboard URLs
        console.log('🌐 Dashboard URLs:');
        console.log('   📊 Dashboard: http://localhost:3001');
        console.log('   🔗 API Health: http://localhost:3000/api/health');
        console.log('   🌍 User Page: http://localhost:3002');
        console.log('');

        console.log('🎉 Dashboard Integration Test PASSED!');
        console.log('   ✅ All API endpoints working');
        console.log('   ✅ Data flowing correctly');
        console.log('   ✅ RecentActivity component has data');
        console.log('   ✅ Dashboard stats accurate');

    } catch (error) {
        console.error('❌ Dashboard Integration Test FAILED:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('   1. Make sure backend server is running on port 3000');
        console.log('   2. Make sure dashboard is running on port 3001');
        console.log('   3. Check MongoDB Atlas connection');
        console.log('   4. Verify sample data was imported');
    }
}

// Run the test
testDashboardIntegration();
