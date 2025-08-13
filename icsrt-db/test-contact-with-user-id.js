// Test creating contact request with user identification
const fetch = require('node-fetch');
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abdo:Abdo12345@cluster0.uzskq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'icsrt_db';

async function testContactWithUserInfo() {
  try {
    // First, make sure Marco's user has the phone number
    console.log('🔄 Step 1: Ensuring Marco has phone number in database...');
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // Update or verify Marco's phone number
    const userEmail = 'ilv2dtagin@wyoxafp.com';
    const phoneNumber = '+201145398963';
    
    await db.collection('users').updateOne(
      { email: userEmail },
      { 
        $set: { 
          phone: phoneNumber,
          fullName: 'Marco',
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    // Get Marco's user ID
    const user = await db.collection('users').findOne({ email: userEmail });
    
    if (!user) {
      console.error('❌ User Marco not found!');
      return;
    }
    
    console.log('✅ User verified:', {
      id: user._id,
      name: user.fullName,
      email: user.email,
      phone: user.phone
    });
    
    await client.close();
    
    // Step 2: Create a contact request with user identification
    console.log('\n🔄 Step 2: Creating contact request with user info...');
    
    const contactData = {
      name: 'Marco', // From user profile
      email: 'ilv2dtagin@wyoxafp.com', // From user profile  
      subject: 'Test WhatsApp Direct Link',
      message: 'This contact request should automatically get my phone number from my user profile.',
      category: 'general',
      userId: user._id.toString(), // Include user ID so system can lookup phone
      timestamp: new Date().toISOString()
      // Note: We're NOT including phone in the request, 
      // the system should get it from the user profile
    };
    
    console.log('📤 Sending contact request with userId:', contactData.userId);
    
    const response = await fetch('http://localhost:3000/api/contact-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Contact request created successfully!');
      console.log('📧 ID:', result.id);
      
      // Step 3: Verify the contact request has the phone number
      console.log('\n🔄 Step 3: Verifying phone number was automatically added...');
      
      const client2 = new MongoClient(MONGODB_URI);
      await client2.connect();
      const db2 = client2.db(DATABASE_NAME);
      
      const contactRequest = await db2.collection('contact_requests').findOne({
        _id: new ObjectId(result.id)
      });
      
      if (contactRequest) {
        console.log('📋 Contact request details:');
        console.log('👤 Name:', contactRequest.name);
        console.log('📧 Email:', contactRequest.email);
        console.log('📱 Phone:', contactRequest.phone || '❌ NO PHONE FOUND');
        console.log('🆔 User ID:', contactRequest.userId);
        console.log('📝 Subject:', contactRequest.subject);
        
        if (contactRequest.phone) {
          console.log('\n✅ SUCCESS! Phone number automatically retrieved from user profile');
          
          // Test WhatsApp URL generation
          const cleanPhone = contactRequest.phone.replace(/[\s\-\(\)\+]/g, '');
          const message = encodeURIComponent(`Hello ${contactRequest.name}! Thank you for your message about "${contactRequest.subject}"`);
          const whatsappURL = `https://wa.me/${cleanPhone}?text=${message}`;
          
          console.log('\n📱 Generated WhatsApp URL:');
          console.log(whatsappURL);
          console.log('\n💡 This URL should work directly in the dashboard now!');
        } else {
          console.log('\n❌ FAILED: Phone number was not automatically retrieved');
        }
      }
      
      await client2.close();
      
    } else {
      console.error('❌ Contact request creation failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('🚀 Testing contact request with automatic phone number retrieval...\n');
testContactWithUserInfo();
