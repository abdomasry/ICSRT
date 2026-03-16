// Test admin data structure
const testAdminData = async () => {
  try {
    console.log('Fetching admins from database...');
    const response = await fetch('http://localhost:3000/api/admins');
    
    if (response.ok) {
      const data = await response.json();
      const admins = Array.isArray(data) ? data : (data?.data || []);
      
      console.log('=== ADMIN DATA STRUCTURE ===');
      console.log('Total admins found:', admins.length);
      
      admins.forEach((admin, index) => {
        console.log(`\nAdmin ${index + 1}:`);
        console.log('- _id:', admin._id);
        console.log('- name:', admin.name);
        console.log('- email:', admin.email);
        console.log('- password:', admin.password);
        console.log('- type:', admin.type);
        console.log('- Full object:', admin);
      });
      
      if (admins.length > 0) {
        console.log('\n=== LOGIN TEST SUGGESTIONS ===');
        const testAdmin = admins[0];
        console.log(`Try logging in with:`);
        console.log(`Username: ${testAdmin.email}`);
        console.log(`Password: ${testAdmin.password}`);
      }
    } else {
      console.error('Failed to fetch admins:', response.status);
    }
  } catch (error) {
    console.error('Error fetching admin data:', error);
  }
};

// Run the test
testAdminData();
