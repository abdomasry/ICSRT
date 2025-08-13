const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority';
const DATABASE_NAME = 'icsrt_main';

async function checkCollections() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DATABASE_NAME);
  
  console.log('Available collections:');
  const collections = await db.listCollections().toArray();
  collections.forEach(col => {
    if (col.name.includes('contact')) {
      console.log('- ' + col.name);
    }
  });
  
  // Check data in each contact-related collection
  const contactCollections = ['contact_requests', 'contact-requests', 'contacts'];
  for (const colName of contactCollections) {
    try {
      const count = await db.collection(colName).countDocuments();
      if (count > 0) {
        console.log(`\n${colName}: ${count} documents`);
        const sample = await db.collection(colName).findOne();
        console.log('Sample document ID:', sample._id);
        console.log('Sample data:', JSON.stringify(sample, null, 2));
      }
    } catch (e) {
      // Collection doesn't exist
    }
  }
  
  await client.close();
}

checkCollections().catch(console.error);
