// Test the contact API endpoint directly
const { MongoClient } = require('mongodb');

async function testContactAPI() {
  console.log('🔍 Testing contact API data structure...\n');
  
  try {
    // Use the working connection string
    const mongoURI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(mongoURI);
    
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('icsrt_main');
    
    // Check what collections exist
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Available collections in icsrt_main:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Check both possible collection names
    const underscoreCount = await db.collection('contact_requests').countDocuments();
    const hyphenCount = await db.collection('contact-requests').countDocuments();
    
    console.log(`\n📊 contact_requests (underscore): ${underscoreCount} documents`);
    console.log(`📊 contact-requests (hyphen): ${hyphenCount} documents`);
    
    // Get data from whichever collection has documents
    let contacts = [];
    if (underscoreCount > 0) {
      contacts = await db.collection('contact_requests').find({}).limit(5).toArray();
      console.log('\n✅ Using contact_requests collection');
    } else if (hyphenCount > 0) {
      contacts = await db.collection('contact-requests').find({}).limit(5).toArray();
      console.log('\n✅ Using contact-requests collection');
    }
    
    if (contacts.length > 0) {
      console.log('\n📄 Sample contact data:');
      console.log('First contact structure:', JSON.stringify(contacts[0], null, 2));
      
      // Test API response format
      const apiResponse = {
        success: true,
        data: contacts
      };
      console.log('\n🔄 API Response Format:');
      console.log(`Success: ${apiResponse.success}`);
      console.log(`Data count: ${apiResponse.data.length}`);
    } else {
      console.log('\n❌ No contact data found in either collection');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testContactAPI();
