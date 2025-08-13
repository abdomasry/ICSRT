// Simple debug test to check server status and admin data
const fetch = require('node-fetch');

const testServer = async () => {
  console.log('🔍 Testing server and admin data...\n');
  
  try {
    // Test 1: Simple login with known super admin
    console.log('=== Test 1: Super Admin Login ===');
    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'superadmin@icsrt.com', 
        password: 'ICSRT@2025!' 
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Super admin login failed');
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Super admin login successful');
    console.log('Token received:', !!loginData.token);
    console.log('Role:', loginData.role);
    console.log('Custom Role:', loginData.customRole);

    // Test 2: Get permissions for super admin
    console.log('\n=== Test 2: Super Admin Permissions ===');
    const permResponse = await fetch('http://localhost:3000/api/admin/my-permissions', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });

    if (!permResponse.ok) {
      console.log('❌ Permission fetch failed');
      return;
    }

    const permData = await permResponse.json();
    console.log('✅ Permission fetch successful');
    console.log('Permissions count:', permData.permissions.length);
    console.log('Has dashboard.view:', permData.permissions.includes('dashboard.view'));
    console.log('Sample permissions:', permData.permissions.slice(0, 5));

    // Test 3: Get all admin data (debug endpoint)
    console.log('\n=== Test 3: All Admin Data ===');
    const adminResponse = await fetch('http://localhost:3000/api/admin/debug-all-admins', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });

    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin data fetch successful');
      console.log('Total admins:', adminData.length);
      adminData.forEach(admin => {
        console.log(`- ${admin.username}: role=${admin.role}, customRole=${admin.customRole || 'none'}, isTrueSuperAdmin=${admin.isTrueSuperAdmin}`);
      });
    } else {
      console.log('❌ Admin data fetch failed:', adminResponse.status);
    }

    // Test 4: Test custom role user
    console.log('\n=== Test 4: Custom Role User (newtestadmin) ===');
    const customLoginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'newtestadmin', 
        password: 'test123' 
      })
    });

    if (!customLoginResponse.ok) {
      console.log('❌ Custom user login failed');
      const errorText = await customLoginResponse.text();
      console.log('Error:', errorText);
    } else {
      const customLoginData = await customLoginResponse.json();
      console.log('✅ Custom user login successful');
      console.log('Role:', customLoginData.role);
      console.log('Custom Role:', customLoginData.customRole);

      // Get permissions for custom user
      const customPermResponse = await fetch('http://localhost:3000/api/admin/my-permissions', {
        headers: { 'Authorization': `Bearer ${customLoginData.token}` }
      });

      if (customPermResponse.ok) {
        const customPermData = await customPermResponse.json();
        console.log('✅ Custom user permissions fetched');
        console.log('Permissions count:', customPermData.permissions.length);
        console.log('Has dashboard.view:', customPermData.permissions.includes('dashboard.view'));
        console.log('All permissions:', customPermData.permissions);
      } else {
        console.log('❌ Custom user permission fetch failed');
      }
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
};

testServer();
