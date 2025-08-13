const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function testExistingCredentials() {
  console.log('🔐 Testing existing admin credentials...\n');
  
  const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('icsrt');
    
    // Test accounts from the rebuild script
    const testAccounts = [
      { email: 'superadmin@icsrt.com', password: 'superadmin123' },
      { email: 'editor@icsrt.com', password: 'editor123' },
      { email: 'manager@icsrt.com', password: 'manager123' },
      { email: 'viewer@icsrt.com', password: 'viewer123' }
    ];
    
    console.log('🧪 Testing login credentials...\n');
    
    for (const testAccount of testAccounts) {
      console.log(`Testing ${testAccount.email}...`);
      
      // Find admin by username/email
      const admin = await db.collection('admins').findOne({
        $or: [
          { username: testAccount.email },
          { email: testAccount.email }
        ]
      });
      
      if (admin) {
        console.log(`  ✅ Account found`);
        console.log(`     Username: ${admin.username}`);
        console.log(`     Role: ${admin.role}`);
        console.log(`     Custom Role: ${admin.customRole || 'None'}`);
        
        // Test password
        const isValidPassword = await bcrypt.compare(testAccount.password, admin.password);
        if (isValidPassword) {
          console.log(`     ✅ Password correct: ${testAccount.password}`);
        } else {
          console.log(`     ❌ Password incorrect`);
        }
      } else {
        console.log(`  ❌ Account not found`);
      }
      console.log();
    }
    
    // Show all admins
    const allAdmins = await db.collection('admins').find({}).toArray();
    console.log(`📊 All admin accounts in database (${allAdmins.length}):`);
    console.log('='.repeat(60));
    
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.username || admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Custom Role: ${admin.customRole || 'None'}`);
      console.log(`   Active: ${admin.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

testExistingCredentials();
