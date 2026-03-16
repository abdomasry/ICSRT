// Quick diagnostic test for contact data
const { MongoClient } = require('mongodb');

async function quickTest() {
  console.log('🔍 Quick database diagnostic...\n');
  
  try {
    // Test the connection
    const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(MONGODB_URI);
    
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');
    
    const db = client.db('icsrt_main');
    
    // List all collections
    console.log('📋 Available collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    console.log('\n📊 Checking contact collections:');
    
    // Check contact_requests (underscore)
    try {
      const count1 = await db.collection('contact_requests').countDocuments();
      console.log(`  contact_requests: ${count1} documents`);
      
      if (count1 > 0) {
        const sample = await db.collection('contact_requests').findOne({});
        console.log('  Sample structure:', Object.keys(sample));
      }
    } catch (e) {
      console.log('  contact_requests: collection not found');
    }
    
    // Check contact-requests (hyphen)
    try {
      const count2 = await db.collection('contact-requests').countDocuments();
      console.log(`  contact-requests: ${count2} documents`);
      
      if (count2 > 0) {
        const sample = await db.collection('contact-requests').findOne({});
        console.log('  Sample structure:', Object.keys(sample));
      }
    } catch (e) {
      console.log('  contact-requests: collection not found');
    }
    
    // Check contacts
    try {
      const count3 = await db.collection('contacts').countDocuments();
      console.log(`  contacts: ${count3} documents`);
      
      if (count3 > 0) {
        const sample = await db.collection('contacts').findOne({});
        console.log('  Sample structure:', Object.keys(sample));
      }
    } catch (e) {
      console.log('  contacts: collection not found');
    }
    
    await client.close();
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();
