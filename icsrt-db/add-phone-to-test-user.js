// Add phone number to test user
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abdo:Abdo12345@cluster0.uzskq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'icsrt_db';

async function addPhoneToTestUser() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // Find the test user with email ilv2dtagin@wyoxafp.com
    const testEmail = 'ilv2dtagin@wyoxafp.com';
    
    const result = await db.collection('users').updateOne(
      { email: testEmail },
      { 
        $set: { 
          phone: '+1234567890',  // Add a test phone number
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log(`✅ Added phone number to user: ${testEmail}`);
      console.log(`📱 Phone: +1234567890`);
      
      // Verify the update
      const user = await db.collection('users').findOne({ email: testEmail });
      console.log(`📋 User details:`, {
        name: user.fullName,
        email: user.email,
        phone: user.phone
      });
    } else {
      console.log(`❌ User not found: ${testEmail}`);
      
      // List all users to see what emails exist
      const users = await db.collection('users').find({}).limit(5).toArray();
      console.log('\n📝 Available users:');
      users.forEach(user => {
        console.log(`- ${user.fullName} (${user.email}) - Phone: ${user.phone || 'No phone'}`);
      });
    }
    
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addPhoneToTestUser();
