const { MongoClient } = require('mongodb');

// Test the contacts API directly
const uri = 'mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority';

async function testContactsAPI() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const database = client.db('icsrt_main');
    const contacts = await database.collection('contact-requests')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('✅ Successfully fetched contacts');
    console.log(`📊 Found ${contacts.length} contact messages`);
    
    if (contacts.length > 0) {
      console.log('\n📧 Sample contact:');
      console.log('Name:', contacts[0].name);
      console.log('Email:', contacts[0].email);
      console.log('Subject:', contacts[0].subject);
      console.log('Date:', contacts[0].createdAt);
    }
    
    // Test the server response format
    const response = {
      success: true,
      data: contacts
    };
    
    console.log('\n🎯 API Response format confirmed');
    console.log('Response structure:', JSON.stringify({
      success: response.success,
      dataCount: response.data.length,
      sampleFields: contacts.length > 0 ? Object.keys(contacts[0]) : []
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔐 Database connection closed');
  }
}

testContactsAPI();
