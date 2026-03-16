// Test the fixed database connection
const { MongoClient } = require('mongodb');

async function testFixedConnection() {
  console.log('🔍 Testing the fixed database connection...\n');
  
  try {
    // Use the corrected connection string
    const mongoURI = "mongodb+srv://abdoeldeep30:YkpYIjW7cV@icsrt.cgphk.mongodb.net/icsrt_main?retryWrites=true&w=majority";
    const client = new MongoClient(mongoURI);
    
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas (correct database)');
    
    const db = client.db('icsrt_main');
    
    // Check contact_requests collection
    const contactCount = await db.collection('contact_requests').countDocuments();
    console.log(`📋 Found ${contactCount} contact requests in database`);
    
    if (contactCount > 0) {
      const contacts = await db.collection('contact_requests').find({}).limit(3).toArray();
      console.log('\n📄 Sample contacts:');
      contacts.forEach((contact, index) => {
        console.log(`${index + 1}. Name: ${contact.name}, Email: ${contact.email}, Subject: ${contact.subject}`);
      });
    }
    
    await client.close();
    console.log('\n✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing connection:', error.message);
  }
}

testFixedConnection();
