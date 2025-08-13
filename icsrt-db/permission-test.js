const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test accounts
const accounts = [
  { username: 'superadmin@icsrt.com', password: 'ICSRT@2025!', expected: 'superadmin', expectedCustomRole: undefined },
  { username: 'admin@icsrt.com', password: 'admin123', expected: 'admin', expectedCustomRole: undefined },
  { username: 'content@icsrt.com', password: 'content123', expected: 'admin', expectedCustomRole: 'content-manager' },
  { username: 'event@icsrt.com', password: 'event123', expected: 'admin', expectedCustomRole: 'event-manager' }
];

async function testLogin(account) {
  try {
    console.log(`\n=== Testing ${account.username} ===`);
    
    // Login
    const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: account.username, password: account.password })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('📄 Login response:', JSON.stringify(loginData, null, 2));

    // Check permissions
    const permResponse = await fetch(`${BASE_URL}/api/admin/my-permissions`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });

    if (!permResponse.ok) {
      console.log('❌ Permission check failed:', await permResponse.text());
      return;
    }

    const permData = await permResponse.json();
    console.log('📋 Permissions:', permData.permissions.length, 'permissions');
    console.log('👤 Role:', permData.role);
    console.log('🎭 Custom Role:', permData.customRole || 'none');
    
    // Check if this is a true super admin (all permissions)
    const isSuper = permData.role === 'superadmin' && !permData.customRole;
    console.log('🔧 Is True Super Admin:', isSuper);
    
    // Check specific permissions
    const hasEditPerms = permData.permissions.includes('papers.edit');
    const hasRoleManage = permData.permissions.includes('roles.manage');
    console.log('✏️  Has papers.edit:', hasEditPerms);
    console.log('👥 Has roles.manage:', hasRoleManage);

    // Test an actual API call that requires permission
    console.log('\n--- Testing API call (GET /api/papers) ---');
    const papersResponse = await fetch(`${BASE_URL}/api/papers`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    console.log('📄 Papers API status:', papersResponse.status, papersResponse.statusText);
    
    // Test a restricted API call (POST /api/papers - requires papers.edit)
    console.log('\n--- Testing restricted API call (POST /api/papers) ---');
    const postResponse = await fetch(`${BASE_URL}/api/papers`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Test Paper', authors: ['Test Author'] })
    });
    console.log('📝 POST Papers API status:', postResponse.status, postResponse.statusText);
    if (!postResponse.ok) {
      const errorData = await postResponse.json();
      console.log('❌ Error:', errorData.error);
    }

  } catch (error) {
    console.log('❌ Error testing account:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Starting Permission Tests...');
  console.log('🔄 Make sure the server is running on localhost:3000\n');

  for (const account of accounts) {
    await testLogin(account);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);
