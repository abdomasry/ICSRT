// Test the profile update with Marco's phone number
const fetch = require('node-fetch');

async function testProfileUpdate() {
  try {
    const profileData = {
      currentEmail: 'ilv2dtagin@wyoxafp.com',
      fullName: 'Marco',
      email: 'ilv2dtagin@wyoxafp.com',
      phone: '+201145398963', // Egypt +20 with the phone number from screenshot
      institution: 'Test Institution'
    };

    console.log('🔄 Updating user profile...');
    console.log('📧 Email:', profileData.currentEmail);
    console.log('📱 Phone:', profileData.phone);
    
    const response = await fetch('http://localhost:3000/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Profile updated successfully!');
      console.log('📋 Updated user:', {
        name: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        institution: result.user.institution
      });
      
      // Now test the phone lookup
      console.log('\n🔍 Testing phone lookup...');
      const lookupResponse = await fetch(`http://localhost:3000/api/users/phone/${encodeURIComponent(profileData.currentEmail)}`);
      const lookupResult = await lookupResponse.json();
      
      if (lookupResult.success) {
        console.log('✅ Phone lookup successful!');
        console.log('📱 Phone found:', lookupResult.user.phone);
        
        // Generate WhatsApp URL
        const cleanPhone = lookupResult.user.phone.replace(/[\s\-\(\)\+]/g, '');
        const message = encodeURIComponent(`Hello ${lookupResult.user.fullName}! Thank you for your message.`);
        const whatsappURL = `https://wa.me/${cleanPhone}?text=${message}`;
        
        console.log('\n📱 WhatsApp URL generated:');
        console.log(whatsappURL);
        console.log('\n💡 This URL should now work directly in the dashboard!');
      } else {
        console.log('❌ Phone lookup failed:', lookupResult.error);
      }
      
    } else {
      console.error('❌ Profile update failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Also test direct database update as fallback
async function directDatabaseUpdate() {
  const { MongoClient } = require('mongodb');
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abdo:Abdo12345@cluster0.uzskq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const DATABASE_NAME = 'icsrt_db';

  try {
    console.log('\n🔄 Direct database update as fallback...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    const result = await db.collection('users').updateOne(
      { email: 'ilv2dtagin@wyoxafp.com' },
      { 
        $set: { 
          phone: '+201145398963',
          fullName: 'Marco',
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Database updated directly!');
      
      // Verify
      const user = await db.collection('users').findOne({ email: 'ilv2dtagin@wyoxafp.com' });
      console.log('📋 Verified user data:', {
        name: user.fullName,
        email: user.email,
        phone: user.phone
      });
    }
    
    await client.close();
  } catch (error) {
    console.error('❌ Database update error:', error);
  }
}

console.log('🚀 Testing profile update with phone number...\n');

// Try API first, then direct database update
testProfileUpdate()
  .then(() => directDatabaseUpdate())
  .catch(error => {
    console.error('❌ Test failed:', error);
    directDatabaseUpdate();
  });
