const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function createTestUserWithOrders() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const database = client.db(DATABASE_NAME);
    
    // Test user email
    const testUserEmail = 'testuser@icsrt.com';
    
    // Check if service orders exist for this user
    const existingOrders = await database.collection('service-orders')
      .find({ userEmail: testUserEmail })
      .toArray();
    
    console.log(`📋 Found ${existingOrders.length} existing orders for ${testUserEmail}`);
    
    if (existingOrders.length === 0) {
      console.log('🔧 Creating test service orders...');
      
      const testOrders = [
        {
          _id: new ObjectId(),
          orderNumber: 'ORD-2024-TEST-001',
          serviceName: 'Conference Registration',
          serviceType: 'conference',
          status: 'completed',
          totalAmount: 350,
          originalAmount: 400,
          discountApplied: 50,
          discountReason: 'Early bird registration',
          userEmail: testUserEmail,
          customerInfo: {
            name: 'Test User',
            email: testUserEmail,
            phone: '+1-234-567-8900',
            whatsapp: '+1-234-567-8900',
            country: 'United States',
            organization: 'Test University',
            designation: 'Test Researcher'
          },
          submittedAt: '2024-07-15T09:00:00Z',
          updatedAt: '2024-07-16T14:30:00Z',
          completedAt: '2024-07-16T14:30:00Z',
          messages: [
            {
              id: 'msg-1',
              sender: 'system',
              channel: 'system',
              message: 'Conference registration submitted successfully.',
              timestamp: '2024-07-15T09:00:00Z',
              read: true,
              senderInfo: 'System'
            },
            {
              id: 'msg-2', 
              sender: 'admin',
              channel: 'userpage',
              message: 'Welcome! We have confirmed your registration for ICSRT 2024. Your early bird discount has been applied.',
              timestamp: '2024-07-15T10:30:00Z',
              read: false,
              senderInfo: 'Admin Team'
            }
          ],
          priceHistory: [
            {
              amount: 400,
              reason: 'Initial registration fee',
              changedBy: 'system',
              timestamp: '2024-07-15T09:00:00Z'
            },
            {
              amount: 350,
              reason: 'Early bird discount applied',
              changedBy: 'admin',
              timestamp: '2024-07-15T09:30:00Z'
            }
          ],
          communicationChannels: {
            userpage: true,
            whatsapp: true,
            email: true
          }
        },
        {
          _id: new ObjectId(),
          orderNumber: 'ORD-2024-TEST-002',
          serviceName: 'Paper Review Service',
          serviceType: 'review',
          status: 'in-progress',
          totalAmount: 250,
          originalAmount: 250,
          userEmail: testUserEmail,
          customerInfo: {
            name: 'Test User',
            email: testUserEmail,
            phone: '+1-234-567-8900',
            whatsapp: '+1-234-567-8900',
            country: 'United States',
            organization: 'Test University',
            designation: 'Test Researcher'
          },
          submittedAt: '2024-07-10T14:30:00Z',
          updatedAt: '2024-07-18T11:00:00Z',
          messages: [
            {
              id: 'msg-3',
              sender: 'system',
              channel: 'system',
              message: 'Paper review request submitted.',
              timestamp: '2024-07-10T14:30:00Z',
              read: true,
              senderInfo: 'System'
            },
            {
              id: 'msg-4',
              sender: 'admin',
              channel: 'userpage',
              message: 'Your paper has been assigned to our expert reviewers. We will provide detailed feedback within 5-7 business days.',
              timestamp: '2024-07-11T09:00:00Z',
              read: false,
              senderInfo: 'Review Team'
            },
            {
              id: 'msg-5',
              sender: 'user',
              channel: 'userpage',
              message: 'Thank you! Looking forward to the feedback.',
              timestamp: '2024-07-11T10:15:00Z',
              read: true,
              senderInfo: 'Test User'
            }
          ],
          priceHistory: [
            {
              amount: 250,
              reason: 'Standard review fee',
              changedBy: 'system',
              timestamp: '2024-07-10T14:30:00Z'
            }
          ],
          communicationChannels: {
            userpage: true,
            whatsapp: true,
            email: true
          }
        }
      ];
      
      const result = await database.collection('service-orders').insertMany(testOrders);
      console.log(`✅ Created ${testOrders.length} test service orders`);
      console.log('📧 Test user email:', testUserEmail);
      
    } else {
      console.log('✅ Test orders already exist');
    }
    
    // Display current orders for the test user
    const orders = await database.collection('service-orders')
      .find({ userEmail: testUserEmail })
      .sort({ submittedAt: -1 })
      .toArray();
      
    console.log(`\n📋 Service orders for ${testUserEmail}:`);
    orders.forEach(order => {
      console.log(`   ${order.orderNumber}: ${order.serviceName} (${order.status}) - $${order.totalAmount}`);
    });
    
    console.log('\n🚀 Next steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Go to the user page: http://localhost:3002');
    console.log('3. Login or use the test user email: testuser@icsrt.com');
    console.log('4. Navigate to Service Orders to see the test data');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestUserWithOrders();
