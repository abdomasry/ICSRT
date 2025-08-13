const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = "mongodb+srv://testuser:testpassword@cluster0.m0q4k.mongodb.net/icsrt_main?retryWrites=true&w=majority";

async function quickTest() {
  console.log('🔍 Testing database connection and service orders...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const database = client.db('icsrt_main');
    
    // Check service orders
    const serviceOrdersCount = await database.collection('service-orders').countDocuments();
    console.log(`📊 Service orders in database: ${serviceOrdersCount}`);
    
    if (serviceOrdersCount === 0) {
      console.log('📝 Creating test service orders...');
      
      const testOrders = [
        {
          _id: new ObjectId(),
          orderNumber: 'ORD-2024-001',
          serviceName: 'Conference Registration',
          serviceType: 'conference',
          status: 'completed',
          totalAmount: 350,
          originalAmount: 400,
          discountApplied: 50,
          discountReason: 'Early bird registration',
          userEmail: 'ahmed@cairo.edu.eg',
          customerInfo: {
            name: 'Ahmed Mohamed',
            email: 'ahmed@cairo.edu.eg',
            phone: '+20-123-456-7890',
            whatsapp: '+20-123-456-7890',
            country: 'Egypt',
            organization: 'Cairo University',
            designation: 'Research Engineer'
          },
          submittedAt: '2024-07-15T09:00:00Z',
          updatedAt: '2024-07-20T14:30:00Z',
          createdAt: '2024-07-15T09:00:00Z',
          priceHistory: [{
            amount: 400,
            reason: 'Initial quote',
            changedBy: 'system',
            timestamp: '2024-07-15T09:00:00Z'
          }],
          messages: [],
          communicationChannels: {
            userpage: true,
            whatsapp: true,
            email: true
          }
        },
        {
          _id: new ObjectId(),
          orderNumber: 'ORD-2024-002',
          serviceName: 'Paper Review Service',
          serviceType: 'review',
          status: 'in-progress',
          totalAmount: 200,
          originalAmount: 250,
          discountApplied: 50,
          discountReason: 'Student discount',
          userEmail: 'sarah@mit.edu',
          customerInfo: {
            name: 'Sarah Johnson',
            email: 'sarah@mit.edu',
            phone: '+1-555-987-6543',
            whatsapp: '+1-555-987-6543',
            country: 'United States',
            organization: 'MIT',
            designation: 'PhD Student'
          },
          submittedAt: '2024-07-10T14:30:00Z',
          updatedAt: '2024-07-22T09:15:00Z',
          createdAt: '2024-07-10T14:30:00Z',
          priceHistory: [{
            amount: 200,
            reason: 'Student discount applied',
            changedBy: 'admin',
            timestamp: '2024-07-11T09:00:00Z'
          }],
          messages: [],
          communicationChannels: {
            userpage: true,
            whatsapp: true,
            email: true
          }
        }
      ];
      
      await database.collection('service-orders').insertMany(testOrders);
      console.log(`✅ Created ${testOrders.length} test service orders`);
    } else {
      console.log('✅ Service orders already exist');
    }
    
    // Display current orders
    const orders = await database.collection('service-orders').find({}).limit(5).toArray();
    console.log('\n📋 Current service orders:');
    orders.forEach(order => {
      console.log(`   ${order.orderNumber}: ${order.serviceName} (${order.status || 'no status'}) - ${order.customerInfo?.name || order.userEmail}`);
    });
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Start the backend server: node server.js');
    console.log('   2. Verify API works: http://localhost:3000/api/admin/service-orders');
    console.log('   3. Refresh your dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

quickTest();
