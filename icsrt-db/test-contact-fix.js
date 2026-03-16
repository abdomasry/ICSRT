// Test the contact database fix
const { MongoClient } = require('mongodb');

async function testContactDatabase() {
  console.log('🔍 Testing contact database connectivity...\n');
  
  try {
    // Use the same connection string from the server
    const mongoURI = "mongodb+srv://abdoeldeep30:YkpYIjW7cV@icsrt.cgphk.mongodb.net/icsrt_main?retryWrites=true&w=majority";
    const client = new MongoClient(mongoURI);
    
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('icsrt_main');
    
    // Check both collection names to see which one has data
    console.log('\n📊 Checking collection names and data:');
    
    // Check contact_requests (underscore)
    try {
      const underscoreCount = await db.collection('contact_requests').countDocuments();
      console.log(`📋 contact_requests (underscore): ${underscoreCount} documents`);
      
      if (underscoreCount > 0) {
        const sample = await db.collection('contact_requests').findOne({});
        console.log('📄 Sample document:', {
          name: sample.name,
          email: sample.email,
          subject: sample.subject,
          timestamp: sample.timestamp || sample.createdAt
        });
      }
    } catch (error) {
      console.log('❌ contact_requests collection error:', error.message);
    }
    
    // Check contact-requests (hyphen)
    try {
      const hyphenCount = await db.collection('contact-requests').countDocuments();
      console.log(`📋 contact-requests (hyphen): ${hyphenCount} documents`);
      
      if (hyphenCount > 0) {
        const sample = await db.collection('contact-requests').findOne({});
        console.log('📄 Sample document:', {
          name: sample.name,
          email: sample.email,
          subject: sample.subject,
          timestamp: sample.timestamp || sample.createdAt
        });
      }
    } catch (error) {
      console.log('❌ contact-requests collection error:', error.message);
    }
    
    await client.close();
    
    console.log('\n🎯 CONCLUSION:');
    console.log('The dashboard should now fetch from the correct collection.');
    console.log('If server is running on port 3000, test: http://localhost:3000/api/contacts');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testContactDatabase();
