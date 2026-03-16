const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function createTestPurchaseData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const database = client.db(DATABASE_NAME);
    
    // Test user email
    const testUserEmail = 'testuser@icsrt.com';
    
    // 1. Create sample coupons
    console.log('🎫 Creating sample coupons...');
    const coupons = [
      {
        _id: new ObjectId(),
        code: 'WELCOME10',
        description: 'Welcome offer - 10% discount',
        discountType: 'percentage',
        discountValue: 10,
        minimumAmount: 50,
        isActive: true,
        usageLimit: 100,
        usedCount: 5,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      },
      {
        _id: new ObjectId(),
        code: 'SAVE50',
        description: 'Fixed $50 discount on orders above $200',
        discountType: 'fixed',
        discountValue: 50,
        minimumAmount: 200,
        isActive: true,
        usageLimit: 50,
        usedCount: 2,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
      },
      {
        _id: new ObjectId(),
        code: 'EARLY20',
        description: 'Early bird special - 20% off',
        discountType: 'percentage',
        discountValue: 20,
        minimumAmount: 100,
        isActive: true,
        usageLimit: 25,
        usedCount: 8,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
      }
    ];
    
    // Check if coupons already exist
    const existingCoupons = await database.collection('coupons').countDocuments();
    if (existingCoupons === 0) {
      await database.collection('coupons').insertMany(coupons);
      console.log(`✅ Created ${coupons.length} sample coupons`);
    } else {
      console.log('✅ Coupons already exist');
    }
    
    // 2. Create confirmed service orders (ready for purchase)
    console.log('📋 Creating confirmed service orders...');
    
    const confirmedOrders = [
      {
        _id: new ObjectId(),
        orderNumber: 'ORD-2024-CONF-001',
        serviceName: 'Premium Conference Registration',
        serviceType: 'conference',
        status: 'confirmed', // Ready for purchase
        paymentStatus: 'pending',
        totalAmount: 450,
        originalAmount: 450,
        userEmail: testUserEmail,
        customerInfo: {
          name: 'Test User',
          email: testUserEmail,
          phone: '+1-234-567-8900',
          whatsapp: '+1-234-567-8900',
          country: 'United States',
          organization: 'Test University',
          designation: 'Research Scientist'
        },
        submittedAt: '2024-07-20T10:00:00Z',
        confirmedAt: '2024-07-21T15:30:00Z',
        updatedAt: '2024-07-21T15:30:00Z',
        messages: [
          {
            id: 'msg-1',
            sender: 'system',
            channel: 'system',
            message: 'Conference registration request submitted successfully.',
            timestamp: '2024-07-20T10:00:00Z',
            read: true,
            senderInfo: 'System'
          },
          {
            id: 'msg-2',
            sender: 'admin',
            channel: 'userpage',
            message: 'Great news! Your conference registration has been confirmed. You can now proceed with payment to secure your spot.',
            timestamp: '2024-07-21T15:30:00Z',
            read: false,
            senderInfo: 'Conference Team'
          },
          {
            id: 'msg-3',
            sender: 'system',
            channel: 'system',
            message: 'Order status changed from "pending" to "confirmed". Ready for payment.',
            timestamp: '2024-07-21T15:30:00Z',
            read: false,
            senderInfo: 'System'
          }
        ],
        priceHistory: [
          {
            amount: 450,
            reason: 'Conference registration fee',
            changedBy: 'system',
            timestamp: '2024-07-20T10:00:00Z'
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
        orderNumber: 'ORD-2024-CONF-002',
        serviceName: 'Paper Publication Service',
        serviceType: 'publication',
        status: 'ready-for-payment', // Alternative status for purchase-ready
        paymentStatus: 'pending',
        totalAmount: 280,
        originalAmount: 320,
        discountApplied: 40,
        discountReason: 'Academic institution discount',
        userEmail: testUserEmail,
        customerInfo: {
          name: 'Test User',
          email: testUserEmail,
          phone: '+1-234-567-8900',
          whatsapp: '+1-234-567-8900',
          country: 'United States',
          organization: 'Test University',
          designation: 'Research Scientist'
        },
        submittedAt: '2024-07-18T14:15:00Z',
        confirmedAt: '2024-07-19T11:45:00Z',
        updatedAt: '2024-07-19T16:20:00Z',
        messages: [
          {
            id: 'msg-4',
            sender: 'system',
            channel: 'system',
            message: 'Paper publication request submitted successfully.',
            timestamp: '2024-07-18T14:15:00Z',
            read: true,
            senderInfo: 'System'
          },
          {
            id: 'msg-5',
            sender: 'admin',
            channel: 'userpage',
            message: 'We have reviewed your paper and confirmed the publication request. Academic discount applied!',
            timestamp: '2024-07-19T11:45:00Z',
            read: false,
            senderInfo: 'Publication Team'
          },
          {
            id: 'msg-6',
            sender: 'system',
            channel: 'system',
            message: 'Price decreased from $320 to $280. Academic institution discount',
            timestamp: '2024-07-19T16:20:00Z',
            read: false,
            senderInfo: 'System'
          }
        ],
        priceHistory: [
          {
            amount: 320,
            reason: 'Initial publication fee',
            changedBy: 'system',
            timestamp: '2024-07-18T14:15:00Z'
          },
          {
            amount: 280,
            reason: 'Academic institution discount',
            changedBy: 'admin',
            timestamp: '2024-07-19T16:20:00Z'
          }
        ],
        communicationChannels: {
          userpage: true,
          whatsapp: true,
          email: true
        }
      }
    ];
    
    // Check existing orders and add confirmed ones
    for (const order of confirmedOrders) {
      const existing = await database.collection('service-orders').findOne({ orderNumber: order.orderNumber });
      if (!existing) {
        await database.collection('service-orders').insertOne(order);
        console.log(`✅ Created confirmed order: ${order.orderNumber}`);
      } else {
        console.log(`✅ Order ${order.orderNumber} already exists`);
      }
    }
    
    // 3. Create sample payment records
    console.log('💳 Creating sample payment records...');
    
    const samplePayments = [
      {
        _id: new ObjectId(),
        orderId: new ObjectId(), // Demo payment for demo order
        orderNumber: 'ORD-2024-DEMO-001',
        userEmail: testUserEmail,
        amount: 350,
        originalAmount: 400,
        currency: 'USD',
        paymentMethod: 'paymob',
        paymentStatus: 'completed',
        appliedCoupon: {
          code: 'WELCOME10',
          discountType: 'percentage',
          discountValue: 10,
          discountAmount: 40
        },
        billingInfo: {
          fullName: 'Test User',
          email: testUserEmail,
          phone: '+1-234-567-8900',
          country: 'United States'
        },
        createdAt: '2024-07-15T09:00:00Z',
        completedAt: '2024-07-15T09:05:00Z',
        updatedAt: '2024-07-15T09:05:00Z',
        paymobData: {
          transaction_id: 'TXN-2024-001',
          order_id: 'PMB-001'
        }
      }
    ];
    
    const existingPayments = await database.collection('payments').countDocuments();
    if (existingPayments === 0) {
      await database.collection('payments').insertMany(samplePayments);
      console.log(`✅ Created ${samplePayments.length} sample payment records`);
    } else {
      console.log('✅ Payment records already exist');
    }
    
    // Display summary
    console.log('\n🎉 Purchase System Test Data Created Successfully!');
    console.log('========================================');
    console.log('📧 Test user email:', testUserEmail);
    console.log('🎫 Available coupons:');
    coupons.forEach(coupon => {
      console.log(`   - ${coupon.code}: ${coupon.description}`);
    });
    console.log('\n📋 Ready-to-purchase orders:');
    confirmedOrders.forEach(order => {
      console.log(`   - ${order.orderNumber}: ${order.serviceName} ($${order.totalAmount}) - Status: ${order.status}`);
    });
    console.log('\n🚀 Next steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Go to the user page: http://localhost:3002');
    console.log('3. Login with email: testuser@icsrt.com');
    console.log('4. Navigate to Service Orders');
    console.log('5. Look for orders with "Ready for payment" status');
    console.log('6. Click "Purchase Now" to test the payment flow');
    console.log('7. Use coupon codes: WELCOME10, SAVE50, or EARLY20');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestPurchaseData();
