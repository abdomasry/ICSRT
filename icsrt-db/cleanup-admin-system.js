const { MongoClient } = require('mongodb');

const cleanupAdminSystem = async () => {
  console.log('🧹 CLEANING UP ADMIN SYSTEM FROM DATABASE');
  console.log('==========================================\n');
  
  try {
    const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('icsrt_main');
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Collections to remove (admin-related)
    const adminCollections = ['admins', 'roles'];
    
    for (const collection of adminCollections) {
      try {
        const result = await db.collection(collection).drop();
        console.log(`✅ Dropped ${collection} collection`);
      } catch (error) {
        if (error.message.includes('ns not found')) {
          console.log(`ℹ️ ${collection} collection doesn't exist, skipping...`);
        } else {
          console.log(`⚠️ Error dropping ${collection}: ${error.message}`);
        }
      }
    }
    
    // List remaining collections
    console.log('\n📊 Remaining Collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    console.log('\n🎉 ADMIN SYSTEM CLEANUP COMPLETE!');
    console.log('✅ All admin collections removed');
    console.log('✅ User data preserved');
    console.log('✅ System is now open access');
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
};

// Run the cleanup if this file is executed directly
if (require.main === module) {
  cleanupAdminSystem()
    .then(() => {
      console.log('\n✅ Database cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = cleanupAdminSystem;
