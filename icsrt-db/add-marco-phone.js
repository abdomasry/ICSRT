// Add Marco's phone number to the user database
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function addMarcoPhone() {
  let client;
  try {
    console.log('🔄 Connecting to database...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    const marcoEmail = 'ilv2dtagin@wyoxafp.com';
    const marcoPhone = '+201145398963';
    const marcoName = 'Marco';
    
    // First, check if Marco exists
    let marco = await db.collection('users').findOne({ 
      email: marcoEmail.toLowerCase()
    });
    
    if (marco) {
      console.log('✅ Marco found in database!');
      console.log(`  Current phone: ${marco.phone || 'NOT SET'}`);
      
      if (!marco.phone) {
        // Update with phone number
        const result = await db.collection('users').updateOne(
          { email: marcoEmail.toLowerCase() },
          { 
            $set: { 
              phone: marcoPhone,
              updatedAt: new Date().toISOString()
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`✅ Added phone number ${marcoPhone} to Marco's profile`);
        } else {
          console.log('❌ Failed to update phone number');
        }
      } else {
        console.log('ℹ️ Marco already has a phone number');
      }
    } else {
      console.log('❌ Marco not found in database');
      console.log('🔄 Creating Marco user with phone number...');
      
      const newUser = {
        fullName: marcoName,
        email: marcoEmail.toLowerCase(),
        phone: marcoPhone,
        userType: 'general',
        institution: '',
        emailVerified: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await db.collection('users').insertOne(newUser);
      
      if (result.insertedId) {
        console.log('✅ Created Marco user with phone number');
        console.log(`  User ID: ${result.insertedId}`);
      } else {
        console.log('❌ Failed to create user');
      }
    }
    
    // Verify the final result
    marco = await db.collection('users').findOne({ 
      email: marcoEmail.toLowerCase()
    });
    
    if (marco) {
      console.log('\n🎯 Final Marco user data:');
      console.log(`  ID: ${marco._id}`);
      console.log(`  Name: ${marco.fullName}`);
      console.log(`  Email: ${marco.email}`);
      console.log(`  Phone: ${marco.phone || 'NOT SET'}`);
      console.log(`  Created: ${marco.createdAt}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

addMarcoPhone();
