const { MongoClient } = require('mongodb');
const fs = require('fs');

const checkAndCreateAdmins = async () => {
  const log = [];
  
  try {
    log.push('🔍 Checking Atlas database...');
    
    const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('icsrt_main');
    
    log.push('✅ Connected to MongoDB Atlas');
    
    // Check existing accounts
    const admins = await db.collection('admins').find({}).toArray();
    log.push(`Found ${admins.length} admin accounts`);
    
    if (admins.length === 0) {
      log.push('❌ No admin accounts found. Please run setup-atlas-admin.js');
    } else {
      log.push('\n📋 Admin accounts:');
      admins.forEach((admin, index) => {
        log.push(`${index + 1}. ${admin.username} (${admin.email}) - Role: ${admin.role} - Status: ${admin.status}`);
      });
    }
    
    // Check roles
    const roles = await db.collection('roles').find({}).toArray();
    log.push(`\nFound ${roles.length} roles`);
    
    await client.close();
    
  } catch (error) {
    log.push(`❌ Error: ${error.message}`);
  }
  
  // Write to file
  fs.writeFileSync('d:\\Abdo\\WORK\\Real Projects\\ICSRT\\admin-check-result.txt', log.join('\n'));
  console.log('Check completed - see admin-check-result.txt');
};

checkAndCreateAdmins();
