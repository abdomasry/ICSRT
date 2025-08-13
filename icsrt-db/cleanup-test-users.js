// Cleanup test users script
// Run with: node cleanup-test-users.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function cleanupTestUsers() {
  console.log('🧹 Cleaning up test users...');
  
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // Remove users with test emails
    const result = await db.collection('users').deleteMany({
      email: { 
        $in: [
          'test@example.com',
          'testuser@example.com',
          /.*@example\.com$/
        ]
      }
    });
    
    console.log(`✅ Removed ${result.deletedCount} test users`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

if (require.main === module) {
  cleanupTestUsers();
}

module.exports = { cleanupTestUsers };
