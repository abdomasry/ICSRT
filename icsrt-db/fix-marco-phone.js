// Complete solution to fix Marco's phone number issue
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function fixMarcoPhoneIssue() {
  let client;
  try {
    console.log('🔧 FIXING MARCO PHONE ISSUE');
    console.log('================================');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    const marcoEmail = 'ilv2dtagin@wyoxafp.com';
    const marcoPhone = '+201145398963';
    const marcoName = 'Marco';
    
    console.log(`\n🎯 Target user: ${marcoName}`);
    console.log(`📧 Email: ${marcoEmail}`);
    console.log(`📱 Phone: ${marcoPhone}`);
    
    // Step 1: Check if Marco exists
    console.log('\n📋 STEP 1: Checking if Marco exists...');
    let marco = await db.collection('users').findOne({ 
      email: marcoEmail.toLowerCase()
    });
    
    if (marco) {
      console.log('✅ Marco found in database');
      console.log(`  ID: ${marco._id}`);
      console.log(`  Name: ${marco.fullName || marco.name}`);
      console.log(`  Email: ${marco.email}`);
      console.log(`  Phone: ${marco.phone || 'NOT SET'}`);
      
      // Update phone if missing
      if (!marco.phone || marco.phone !== marcoPhone) {
        console.log('\n🔄 Updating Marco\'s phone number...');
        const result = await db.collection('users').updateOne(
          { _id: marco._id },
          { 
            $set: { 
              phone: marcoPhone,
              updatedAt: new Date().toISOString()
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log('✅ Phone number updated successfully');
        } else {
          console.log('❌ Failed to update phone number');
        }
      } else {
        console.log('✅ Phone number is already correct');
      }
    } else {
      console.log('❌ Marco not found in database');
      console.log('🔄 Creating Marco\'s user record...');
      
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
        console.log('✅ Created Marco\'s user record');
        console.log(`  New User ID: ${result.insertedId}`);
      } else {
        console.log('❌ Failed to create user record');
        return;
      }
    }
    
    // Step 2: Verify the fix
    console.log('\n📋 STEP 2: Verifying the fix...');
    marco = await db.collection('users').findOne({ 
      email: marcoEmail.toLowerCase()
    });
    
    if (marco && marco.phone === marcoPhone) {
      console.log('✅ VERIFICATION SUCCESSFUL!');
      console.log(`  Marco's phone: ${marco.phone}`);
      console.log(`  Expected: ${marcoPhone}`);
      console.log('  ✅ Phone numbers match!');
    } else {
      console.log('❌ VERIFICATION FAILED!');
      console.log(`  Marco's phone: ${marco?.phone || 'NOT FOUND'}`);
      console.log(`  Expected: ${marcoPhone}`);
    }
    
    // Step 3: Test the API endpoint simulation
    console.log('\n📋 STEP 3: Testing API lookup simulation...');
    const apiTestUser = await db.collection('users').findOne(
      { email: marcoEmail.toLowerCase() },
      { projection: { phone: 1, fullName: 1, email: 1 } }
    );
    
    if (apiTestUser) {
      console.log('✅ API simulation successful');
      console.log('  Response would be:', JSON.stringify({
        success: true,
        user: {
          phone: apiTestUser.phone,
          fullName: apiTestUser.fullName,
          email: apiTestUser.email
        }
      }, null, 2));
    } else {
      console.log('❌ API simulation failed - user not found');
    }
    
    console.log('\n🎉 SOLUTION COMPLETE!');
    console.log('================================');
    console.log('Next steps:');
    console.log('1. Start your server: node server.js');
    console.log('2. Test the WhatsApp reply in dashboard');
    console.log('3. Marco\'s phone should now appear correctly');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

fixMarcoPhoneIssue();
