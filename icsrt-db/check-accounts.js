const { MongoClient } = require('mongodb');

const checkAdminAccounts = async () => {
  console.log('🔍 Checking existing admin accounts...\n');
  
  try {
    const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('icsrt');
    
    // Check admin accounts
    const admins = await db.collection('admins').find({}).toArray();
    
    console.log(`📊 Found ${admins.length} admin accounts:`);
    console.log('=' .repeat(50));
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Custom Role: ${admin.customRole || 'None'}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Password Hash: ${admin.password ? 'Set' : 'Missing'}`);
      console.log('-'.repeat(40));
    });
    
    // Check custom roles
    const roles = await db.collection('roles').find({}).toArray();
    console.log(`\n🎭 Found ${roles.length} custom roles:`);
    console.log('=' .repeat(50));
    
    roles.forEach((role, index) => {
      console.log(`${index + 1}. Role ID: ${role._id}`);
      console.log(`   Name: ${role.name}`);
      console.log(`   Display Name: ${role.displayName}`);
      console.log(`   Permissions: ${role.permissions?.length || 0}`);
      console.log(`   Created: ${role.createdAt}`);
      console.log('-'.repeat(40));
    });
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error checking accounts:', error.message);
  }
};

checkAdminAccounts();
