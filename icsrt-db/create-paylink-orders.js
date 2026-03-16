// Create specific test order that will trigger Pay Link button
const { MongoClient } = require('mongodb');

async function createPurchaseLinkTestOrder() {
  const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const database = client.db('icsrt_main');
    
    // Create a service order that meets all conditions for Pay Link button
    const testOrder = {
      userEmail: 'testuser@icsrt.com',
      fullName: 'John Doe',
      email: 'testuser@icsrt.com',
      phone: '+1234567890',
      serviceType: 'E-commerce Website Development',
      projectDetails: 'Complete e-commerce solution with admin panel and payment integration',
      status: 'confirmed',  // Must be 'confirmed' for Pay Link
      paymentStatus: 'pending',  // Must NOT be 'paid' or 'completed'
      totalAmount: 2500,  // Must be > 0
      customerInfo: {
        name: 'John Doe',
        email: 'testuser@icsrt.com',
        phone: '+1234567890',
        country: 'United States',
        organization: 'Tech Solutions Inc',
        designation: 'Software Engineer'
      },
      submittedAt: new Date(),
      createdAt: new Date(),
      lastMessageAt: new Date(),
      messages: [
        {
          sender: 'user',
          senderInfo: 'John Doe',
          message: 'Hello, I need a complete e-commerce solution for my business.',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          channel: 'userpage'
        },
        {
          sender: 'admin',
          senderInfo: 'ICSRT Team',
          message: 'Thank you for your inquiry! We have confirmed your order and prepared a custom quote.',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          channel: 'userpage'
        }
      ]
    };
    
    // Insert the test order
    const result = await database.collection('service_orders').insertOne(testOrder);
    console.log('✅ Test order created with Pay Link eligibility:', result.insertedId);
    
    // Create another test order
    const testOrder2 = {
      userEmail: 'customer@icsrt.com',
      fullName: 'Jane Smith',
      email: 'customer@icsrt.com',
      phone: '+1987654321',
      serviceType: 'Mobile App Development',
      projectDetails: 'Cross-platform mobile application for iOS and Android',
      status: 'confirmed',  // Must be 'confirmed' for Pay Link
      paymentStatus: 'pending',  // Must NOT be 'paid' or 'completed'
      totalAmount: 3500,  // Must be > 0
      customerInfo: {
        name: 'Jane Smith',
        email: 'customer@icsrt.com',
        phone: '+1987654321',
        country: 'Canada',
        organization: 'Digital Ventures',
        designation: 'Marketing Director'
      },
      submittedAt: new Date(),
      createdAt: new Date(),
      lastMessageAt: new Date(),
      messages: [
        {
          sender: 'user',
          senderInfo: 'Jane Smith',
          message: 'I need a mobile app for my digital marketing agency.',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          channel: 'userpage'
        }
      ]
    };
    
    const result2 = await database.collection('service_orders').insertOne(testOrder2);
    console.log('✅ Second test order created with Pay Link eligibility:', result2.insertedId);
    
    console.log('\n🎯 These orders should show Pay Link buttons because:');
    console.log('   - status: "confirmed" ✅');
    console.log('   - paymentStatus: "pending" ✅');
    console.log('   - totalAmount > 0 ✅');
    
  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  } finally {
    await client.close();
  }
}

createPurchaseLinkTestOrder();
