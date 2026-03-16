// Quick test to verify the backend is working correctly
const fetch = require('node-fetch');

const testLogin = async (username, password, expectedRole, expectedCustomRole) => {
  console.log(`\n=== Testing ${username} ===`);
  
  try {
    // Login
    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
      return false;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`👤 Role: ${loginData.role}, Custom Role: ${loginData.customRole || 'none'}`);

    // Get permissions
    const permResponse = await fetch('http://localhost:3000/api/admin/my-permissions', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });

    if (!permResponse.ok) {
      const errorText = await permResponse.text();
      console.log('❌ Permission check failed:', errorText);
      return false;
    }

    const permData = await permResponse.json();
    console.log(`📋 Permissions: ${permData.permissions.length} total`);
    console.log('📝 Permission list:', permData.permissions.join(', '));
    
    // Check if this matches expectation
    const isTrueSuperAdmin = permData.role === 'superadmin' && !permData.customRole;
    console.log(`🔧 Is True Super Admin: ${isTrueSuperAdmin}`);
    console.log(`✏️  Has papers.edit: ${permData.permissions.includes('papers.edit')}`);
    console.log(`👥 Has roles.manage: ${permData.permissions.includes('roles.manage')}`);
    console.log(`📊 Has dashboard.view: ${permData.permissions.includes('dashboard.view')}`);
    
    // Test actual API calls
    console.log('\n--- Testing API Calls ---');
    
    // Test dashboard access (should work for everyone)
    const dashResponse = await fetch('http://localhost:3000/api/admin/my-permissions', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    console.log(`📊 Dashboard access: ${dashResponse.ok ? 'ALLOWED' : 'DENIED'}`);
    
    // Test papers access 
    const papersResponse = await fetch('http://localhost:3000/api/papers', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    console.log(`📄 Papers view: ${papersResponse.ok ? 'ALLOWED' : 'DENIED'}`);
    
    // Test papers edit (POST)
    const paperCreateResponse = await fetch('http://localhost:3000/api/papers', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Test Paper', author: 'Test Author' })
    });
    console.log(`✏️  Papers edit: ${paperCreateResponse.ok ? 'ALLOWED' : 'DENIED'}`);
    
    // Test roles management
    const rolesResponse = await fetch('http://localhost:3000/api/admin/roles', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    console.log(`👥 Roles manage: ${rolesResponse.ok ? 'ALLOWED' : 'DENIED'}`);
    
    return true;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
};

// Test all accounts
(async () => {
  console.log('🧪 Testing Backend Permission Logic...\n');
  
  const tests = [
    ['superadmin@icsrt.com', 'ICSRT@2025!', 'superadmin', undefined],
    ['content@icsrt.com', 'content123', 'admin', 'content-manager'],
    ['event@icsrt.com', 'event123', 'admin', 'event-manager'],
    ['newtestadmin', 'test123', 'admin', 'newtestadmin']
  ];
  
  for (const [username, password, expectedRole, expectedCustomRole] of tests) {
    await testLogin(username, password, expectedRole, expectedCustomRole);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✅ Test completed!');
})();
