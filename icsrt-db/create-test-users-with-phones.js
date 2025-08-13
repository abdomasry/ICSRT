// Create test users with phone numbers including Marco
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function createTestUsersWithPhones() {
  let client;
  try {
    console.log('📞 CREATING TEST USERS WITH PHONE NUMBERS');
    console.log('==========================================');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Test users to create/update with phone numbers
    const testUsers = [
      {
        fullName: 'Marco',
        email: 'ilv2dtagin@wyoxafp.com',
        phone: '+201145398963', // From the screenshot
        userType: 'general',
        institution: 'No institution provided',
        emailVerified: true,
        status: 'active'
      },
      {
        fullName: 'Test User 1',
        email: 'test1@example.com',
        phone: '+201234567890',
        userType: 'general',
        institution: 'Test University',
        emailVerified: true,
        status: 'active'
      },
      {
        fullName: 'Test User 2',
        email: 'test2@example.com',
        phone: '+201987654321',
        userType: 'general',
        institution: 'Another University',
        emailVerified: true,
        status: 'active'
      }
    ];
    
    console.log(`\n👥 Creating/updating ${testUsers.length} test users...`);
    
    for (const userData of testUsers) {
      // Check if user exists
      const existingUser = await db.collection('users').findOne({
        email: userData.email.toLowerCase()
      });
      
      if (existingUser) {
        console.log(`\n📝 Updating existing user: ${userData.fullName}`);
        
        const updateResult = await db.collection('users').updateOne(
          { email: userData.email.toLowerCase() },
          {
            $set: {
              ...userData,
              email: userData.email.toLowerCase(),
              updatedAt: new Date().toISOString()
            }
          }
        );
        
        if (updateResult.modifiedCount > 0) {
          console.log(`✅ Updated ${userData.fullName} with phone ${userData.phone}`);
        } else {
          console.log(`ℹ️ ${userData.fullName} already has correct data`);
        }
      } else {
        console.log(`\n👤 Creating new user: ${userData.fullName}`);
        
        const newUser = {
          ...userData,
          email: userData.email.toLowerCase(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const insertResult = await db.collection('users').insertOne(newUser);
        
        if (insertResult.insertedId) {
          console.log(`✅ Created ${userData.fullName} with phone ${userData.phone}`);
          console.log(`   User ID: ${insertResult.insertedId}`);
        } else {
          console.log(`❌ Failed to create ${userData.fullName}`);
        }
      }
    }
    
    // Verify all users
    console.log('\n📋 VERIFICATION - All users with phone numbers:');
    const allUsers = await db.collection('users').find({}).toArray();
    
    allUsers.forEach((user, i) => {
      console.log(`${i+1}. ${user.fullName || 'NO NAME'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone || '❌ MISSING'}`);
      console.log(`   Created: ${user.createdAt || 'Unknown'}`);
      console.log('');
    });
    
    console.log('🎉 SETUP COMPLETE!');
    console.log('==========================================');
    console.log('Next steps:');
    console.log('1. Start userpage: cd icsrt-userpage && npm start');
    console.log('2. Log in as Marco (or create account with phone)');
    console.log('3. Go to contact page - phone should auto-fill');
    console.log('4. Send a message with phone number included');
    console.log('5. Check dashboard - should show phone for WhatsApp');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

createTestUsersWithPhones();
