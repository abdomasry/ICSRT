// Ensure test users have phone numbers
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function ensureUsersHavePhones() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    console.log('🔍 Checking users without phone numbers...');
    
    // Find users without phone numbers
    const usersWithoutPhones = await db.collection('users').find({ 
      $or: [
        { phone: null },
        { phone: { $exists: false } },
        { phone: '' }
      ]
    }).toArray();
    
    console.log(`📊 Found ${usersWithoutPhones.length} users without phone numbers`);
    
    // Add phone numbers to users
    let updatedCount = 0;
    for (const user of usersWithoutPhones) {
      let phoneNumber;
      
      // Special case for Marco - use his real phone number
      if (user.email && user.email.toLowerCase() === 'ilv2dtagin@wyoxafp.com') {
        phoneNumber = '+201145398963'; // Marco's real phone number from screenshot
        console.log(`🎯 Using Marco's real phone number: ${phoneNumber}`);
      } else {
        // Generate a test phone number for others
        phoneNumber = `+123456${String(updatedCount).padStart(4, '0')}`;
      }
      
      const result = await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { 
            phone: phoneNumber,
            updatedAt: new Date().toISOString()
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Added phone ${phoneNumber} to ${user.fullName} (${user.email})`);
        updatedCount++;
      }
    }
    
    console.log(`\n📱 Updated ${updatedCount} users with phone numbers`);
    
    // Show all users with their phone numbers
    console.log('\n📋 All users with phone numbers:');
    const allUsers = await db.collection('users').find({}).toArray();
    allUsers.forEach((user, i) => {
      console.log(`${i+1}. ${user.fullName} (${user.email}) - Phone: ${user.phone || 'MISSING'}`);
    });
    
    await client.close();
    
    console.log('\n✅ Done! Now test the WhatsApp reply feature in the dashboard.');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

ensureUsersHavePhones();
