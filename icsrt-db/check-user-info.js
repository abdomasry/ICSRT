// Check user information for the test user
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abdo:Abdo12345@cluster0.uzskq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'icsrt_db';

async function checkUserInfo() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // Check the specific user from the screenshot
    const testEmail = 'ilv2dtagin@wyoxafp.com';
    console.log(`🔍 Looking for user: ${testEmail}`);
    
    const user = await db.collection('users').findOne({ email: testEmail });
    
    if (user) {
      console.log('✅ User found:');
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.fullName);
      console.log('📱 Phone:', user.phone || '❌ NO PHONE NUMBER');
      console.log('🏢 Institution:', user.institution);
      console.log('🌍 Country:', user.country);
      console.log('📅 Created:', user.createdAt);
      
      if (!user.phone) {
        console.log('\n💡 Adding a phone number to this user...');
        const result = await db.collection('users').updateOne(
          { email: testEmail },
          { 
            $set: { 
              phone: '+1234567890',
              updatedAt: new Date().toISOString()
            } 
          }
        );
        console.log('✅ Phone number added:', result.modifiedCount > 0 ? 'Success' : 'Failed');
      }
    } else {
      console.log('❌ User not found');
      
      // Show all users to debug
      const allUsers = await db.collection('users').find({}).limit(10).toArray();
      console.log('\n📋 All users in database:');
      allUsers.forEach((u, i) => {
        console.log(`${i+1}. ${u.fullName} (${u.email}) - Phone: ${u.phone || 'None'}`);
      });
    }
    
    // Also check contact requests
    console.log('\n📨 Checking contact requests...');
    const contactRequests = await db.collection('contact_requests').find({}).sort({ timestamp: -1 }).limit(5).toArray();
    contactRequests.forEach((req, i) => {
      console.log(`${i+1}. ${req.name} (${req.email}) - Phone: ${req.phone || 'None'} - Subject: ${req.subject}`);
    });
    
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserInfo();
