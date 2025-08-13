const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://testuser:testpassword@cluster0.m0q4k.mongodb.net/icsrt_main?retryWrites=true&w=majority";

async function checkServiceOrders() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('icsrt_main');
    const serviceOrders = database.collection('service-orders');
    
    // Count documents
    const count = await serviceOrders.countDocuments();
    console.log(`Total service orders: ${count}`);
    
    // Get first few orders
    const orders = await serviceOrders.find({}).limit(5).toArray();
    console.log('Sample orders:', JSON.stringify(orders, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkServiceOrders();
