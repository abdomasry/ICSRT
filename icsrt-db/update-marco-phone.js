// Update user phone number to match the profile shown in screenshot
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abdo:Abdo12345@cluster0.uzskq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'icsrt_db';

async function updateUserPhone() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // The user from screenshot: ilv2dtagin@wyoxafp.com
    // Name: Marco 
    // Phone: EG +20 01145398963 = +201145398963
    const userEmail = 'ilv2dtagin@wyoxafp.com';
    const phoneNumber = '+201145398963'; // Egypt country code + phone number
    
    console.log(`🔍 Looking for user: ${userEmail}`);
    
    // First, let's see what's currently in the database
    const currentUser = await db.collection('users').findOne({ email: userEmail });
    
    if (currentUser) {
      console.log('📋 Current user data:');
      console.log('👤 Name:', currentUser.fullName);
      console.log('📧 Email:', currentUser.email);
      console.log('📱 Current Phone:', currentUser.phone || 'None');
      console.log('🏢 Institution:', currentUser.institution || 'None');
      
      // Update the phone number
      const result = await db.collection('users').updateOne(
        { email: userEmail },
        { 
          $set: { 
            phone: phoneNumber,
            fullName: 'Marco', // Update name to match screenshot
            updatedAt: new Date().toISOString()
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Successfully updated user phone to: ${phoneNumber}`);
        
        // Verify the update
        const updatedUser = await db.collection('users').findOne({ email: userEmail });
        console.log('📋 Updated user data:');
        console.log('👤 Name:', updatedUser.fullName);
        console.log('📱 Phone:', updatedUser.phone);
        
        // Test the WhatsApp URL generation
        const cleanPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
        console.log(`🧪 Clean phone for WhatsApp: ${cleanPhone}`);
        console.log(`📱 WhatsApp URL: https://wa.me/${cleanPhone}`);
      } else {
        console.log('❌ Failed to update user phone');
      }
    } else {
      console.log(`❌ User not found: ${userEmail}`);
      
      // Show all users to see what's available
      const allUsers = await db.collection('users').find({}).toArray();
      console.log('\n📋 All users in database:');
      allUsers.forEach((user, i) => {
        console.log(`${i+1}. ${user.fullName || 'No name'} (${user.email}) - Phone: ${user.phone || 'None'}`);
      });
    }
    
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateUserPhone();
