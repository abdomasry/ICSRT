// Simple database connection test
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";

async function testConnection() {
  let client;
  try {
    console.log('🔄 Testing database connection...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('icsrt_main');
    
    // Count users
    const userCount = await db.collection('users').countDocuments();
    console.log(`� Total users: ${userCount}`);
    
    // Find Marco by email from screenshot
    const marcoByEmail = await db.collection('users').findOne({ 
      email: 'ilv2dtagin@wyoxafp.com'
    });
    
    console.log('\n� Marco by email (ilv2dtagin@wyoxafp.com):');
    if (marcoByEmail) {
      console.log('✅ FOUND!');
      console.log(`  ID: ${marcoByEmail._id}`);
      console.log(`  Name: ${marcoByEmail.fullName}`);
      console.log(`  Email: ${marcoByEmail.email}`);
      console.log(`  Phone: ${marcoByEmail.phone || 'NOT SET'}`);
    } else {
      console.log('❌ NOT FOUND by email');
      
      // Try case insensitive
      const marcoInsensitive = await db.collection('users').findOne({ 
        email: /ilv2dtagin@wyoxafp\.com/i
      });
      
      if (marcoInsensitive) {
        console.log('✅ Found with case insensitive search!');
        console.log(`  Email in DB: "${marcoInsensitive.email}"`);
        console.log(`  Phone: ${marcoInsensitive.phone || 'NOT SET'}`);
      } else {
        console.log('❌ Still not found with case insensitive');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testConnection();
