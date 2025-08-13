const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function quickTest() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully');
    
    const database = client.db(DATABASE_NAME);
    
    // Check existing service orders
    const count = await database.collection('service-orders').countDocuments();
    console.log(`Current service-orders count: ${count}`);
    
    if (count === 0) {
      console.log('Creating test service order...');
      
      const testOrder = {
        _id: new ObjectId(),
        orderNumber: 'ORD-2024-QUICK-001',
        serviceName: 'Quick Test Service',
        serviceType: 'test',
        status: 'pending',
        totalAmount: 100,
        userEmail: 'testuser@icsrt.com',
        customerInfo: {
          name: 'Test User',
          email: 'testuser@icsrt.com',
          phone: '+1-234-567-8900'
        },
        submittedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-1',
            sender: 'system',
            channel: 'system',
            message: 'Test order created successfully.',
            timestamp: new Date().toISOString(),
            read: true,
            senderInfo: 'System'
          }
        ]
      };
      
      await database.collection('service-orders').insertOne(testOrder);
      console.log('✅ Test order created');
    }
    
    // Get sample order
    const sample = await database.collection('service-orders').findOne({});
    console.log('\nSample order structure:');
    console.log(JSON.stringify(sample, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Disconnected');
  }
}

quickTest();
