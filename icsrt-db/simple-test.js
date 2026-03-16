// Minimal test with just the users we know exist
const fetch = require('node-fetch');

const testKnownUsers = async () => {
  console.log('🔍 Testing known users only...\n');
  
  // Start server if needed (in a real scenario)
  setTimeout(async () => {
    try {
      // Test 1: Super Admin (we know this works)
      console.log('=== Super Admin Test ===');
      const superResponse = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: 'superadmin@icsrt.com', 
          password: 'ICSRT@2025!' 
        })
      });

      if (superResponse.ok) {
        const superData = await superResponse.json();
        console.log('✅ Super Admin login successful');
        console.log(`Role: ${superData.role}, Custom Role: ${superData.customRole || 'none'}`);
        
        // Test permissions
        const permResponse = await fetch('http://localhost:3000/api/admin/my-permissions', {
          headers: { 'Authorization': `Bearer ${superData.token}` }
        });
        
        if (permResponse.ok) {
          const permData = await permResponse.json();
          console.log(`Permissions: ${permData.permissions.length}`);
          console.log(`Is true super admin: ${permData.role === 'superadmin' && !permData.customRole}`);
        }
      }

      // Test 2: Regular Admin (admin@icsrt.com)
      console.log('\n=== Regular Admin Test ===');
      const adminResponse = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: 'admin@icsrt.com', 
          password: 'admin123' 
        })
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('✅ Regular Admin login successful');
        console.log(`Role: ${adminData.role}, Custom Role: ${adminData.customRole || 'none'}`);
        
        // Test permissions
        const adminPermResponse = await fetch('http://localhost:3000/api/admin/my-permissions', {
          headers: { 'Authorization': `Bearer ${adminData.token}` }
        });
        
        if (adminPermResponse.ok) {
          const adminPermData = await adminPermResponse.json();
          console.log(`Permissions: ${adminPermData.permissions.length}`);
          console.log(`Has papers.edit: ${adminPermData.permissions.includes('papers.edit')}`);
          console.log(`Has roles.manage: ${adminPermData.permissions.includes('roles.manage')}`);
        }
      } else {
        const errorText = await adminResponse.text();
        console.log(`❌ Regular Admin login failed: ${errorText}`);
      }

    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }, 2000); // Wait 2 seconds for server to start
};

testKnownUsers();
