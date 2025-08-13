// Comprehensive database and server fix
const { MongoClient } = require('mongodb');

// All possible connection strings to test
const connections = [
  {
    name: "Primary Atlas (icsrt:admin)",
    uri: "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority"
  },
  {
    name: "Secondary Atlas (abdoeldeep30)",
    uri: "mongodb+srv://abdoeldeep30:YkpYIjW7cV@icsrt.cgphk.mongodb.net/icsrt_main?retryWrites=true&w=majority"
  }
];

// Possible collection names
const collectionNames = ['contact_requests', 'contact-requests', 'contacts', 'contactRequests'];

async function findWorkingDatabase() {
  console.log('🔍 Finding the correct database with contact data...\n');
  
  for (const connection of connections) {
    console.log(`\n📡 Testing: ${connection.name}`);
    
    try {
      const client = new MongoClient(connection.uri);
      await client.connect();
      console.log('✅ Connected successfully');
      
      const db = client.db('icsrt_main');
      
      // List all collections
      const collections = await db.listCollections().toArray();
      const collectionList = collections.map(c => c.name);
      console.log(`📋 Collections found: ${collectionList.join(', ')}`);
      
      // Test each possible collection name
      for (const collectionName of collectionNames) {
        try {
          const count = await db.collection(collectionName).countDocuments();
          if (count > 0) {
            console.log(`✅ Found ${count} documents in ${collectionName}`);
            
            // Get sample data
            const sample = await db.collection(collectionName).findOne({});
            console.log('📄 Sample document structure:');
            console.log(JSON.stringify(sample, null, 2));
            
            console.log(`\n🎯 SOLUTION FOUND:`);
            console.log(`Database URI: ${connection.uri}`);
            console.log(`Collection: ${collectionName}`);
            console.log(`Document count: ${count}`);
            
            await client.close();
            return {
              uri: connection.uri,
              collection: collectionName,
              count: count
            };
          }
        } catch (collectionError) {
          // Collection doesn't exist, continue
        }
      }
      
      await client.close();
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ No contact data found in any database');
  return null;
}

async function updateServerConfig(solution) {
  if (!solution) {
    console.log('❌ Cannot update server - no working database found');
    return;
  }
  
  console.log('\n🔧 Server configuration needed:');
  console.log(`MONGODB_URI = "${solution.uri}"`);
  console.log(`Collection name: ${solution.collection}`);
  console.log(`Expected API response: { success: true, data: [...${solution.count} contacts...] }`);
}

// Run the diagnostic
findWorkingDatabase().then(updateServerConfig).catch(console.error);
