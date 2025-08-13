const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Enhanced Test Data Creation with Purchase Link Demo
 * Creates comprehensive test data and generates purchase links automatically
 */
async function createEnhancedTestData() {
  const uri = 'mongodb+srv://icsrt:Rawan2024@cluster0.mongodb.net/icsrt_main?retryWrites=true&w=majority';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('icsrt_main');
    
    console.log('\n🚀 Creating Enhanced Test Data with Purchase Links...\n');

    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('serviceOrders').deleteMany({});
    await db.collection('coupons').deleteMany({});
    await db.collection('purchaseLinks').deleteMany({});
    
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminHashedPassword = await bcrypt.hash('admin123', 10);
    
    const users = [
      {
        _id: new ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'testuser@icsrt.com',
        password: hashedPassword,
        phone: '+1234567890',
        country: 'United States',
        organization: 'Tech Solutions Inc',
        designation: 'Software Engineer',
        role: 'user',
        isVerified: true,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@icsrt.com',
        password: adminHashedPassword,
        phone: '+1987654321',
        country: 'United States',
        organization: 'ICSRT',
        designation: 'Administrator',
        role: 'admin',
        isVerified: true,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'customer@icsrt.com',
        password: hashedPassword,
        phone: '+1555666777',
        country: 'Canada',
        organization: 'Digital Marketing Pro',
        designation: 'Marketing Manager',
        role: 'user',
        isVerified: true,
        createdAt: new Date()
      }
    ];
    
    await db.collection('users').insertMany(users);
    console.log('✅ Test users created:');
    console.log('   📧 testuser@icsrt.com / password123');
    console.log('   👑 admin@icsrt.com / admin123');
    console.log('   📧 customer@icsrt.com / password123');

    // Create service orders with different statuses
    const now = new Date();
    const orders = [
      {
        _id: new ObjectId(),
        userEmail: 'testuser@icsrt.com',
        serviceName: 'E-commerce Website Development',
        description: 'Complete e-commerce solution with payment gateway, admin panel, and mobile responsive design',
        requirements: 'React.js frontend, Node.js backend, MongoDB database, Stripe/PayPal integration, admin dashboard',
        status: 'confirmed',
        totalAmount: 2500,
        paymentStatus: 'pending',
        customerInfo: {
          name: 'John Doe',
          email: 'testuser@icsrt.com',
          phone: '+1234567890',
          country: 'United States',
          organization: 'Tech Solutions Inc',
          designation: 'Software Engineer'
        },
        messages: [
          {
            sender: 'user',
            senderInfo: 'John Doe',
            message: 'Hello! I need a complete e-commerce website for my business. Can you provide a quote?',
            timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            channel: 'userpage'
          },
          {
            sender: 'admin',
            senderInfo: 'ICSRT Development Team',
            message: 'Thank you for your inquiry! We have reviewed your requirements and prepared a comprehensive quote. Your order is now confirmed and ready for payment.',
            timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            channel: 'userpage'
          }
        ],
        priceHistory: [
          {
            oldPrice: 3000,
            newPrice: 2500,
            reason: 'Early bird discount - 15% off for new customers',
            changedBy: 'admin@icsrt.com',
            timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
          }
        ],
        submittedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        lastMessageAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        priceUpdatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        _id: new ObjectId(),
        userEmail: 'customer@icsrt.com',
        serviceName: 'Mobile App Development',
        description: 'Cross-platform mobile application for food delivery service',
        requirements: 'React Native app, real-time tracking, payment integration, push notifications',
        status: 'confirmed',
        totalAmount: 3500,
        paymentStatus: 'pending',
        customerInfo: {
          name: 'Jane Smith',
          email: 'customer@icsrt.com',
          phone: '+1555666777',
          country: 'Canada',
          organization: 'Digital Marketing Pro',
          designation: 'Marketing Manager'
        },
        messages: [
          {
            sender: 'user',
            senderInfo: 'Jane Smith',
            message: 'I need a mobile app for my food delivery business. What features can you include?',
            timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            channel: 'userpage'
          },
          {
            sender: 'admin',
            senderInfo: 'ICSRT Mobile Team',
            message: 'We can build a comprehensive food delivery app with GPS tracking, payment gateway, and admin dashboard. Your quote is ready!',
            timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
            channel: 'userpage'
          }
        ],
        submittedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        lastMessageAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        _id: new ObjectId(),
        userEmail: 'testuser@icsrt.com',
        serviceName: 'Digital Marketing Campaign',
        description: 'Complete digital marketing package with SEO, social media, and PPC advertising',
        requirements: 'SEO optimization, Google Ads setup, Facebook/Instagram marketing, analytics dashboard',
        status: 'in-progress',
        totalAmount: 1200,
        paymentStatus: 'paid',
        customerInfo: {
          name: 'John Doe',
          email: 'testuser@icsrt.com',
          phone: '+1234567890',
          country: 'United States',
          organization: 'Tech Solutions Inc',
          designation: 'Software Engineer'
        },
        messages: [
          {
            sender: 'admin',
            senderInfo: 'ICSRT Marketing Team',
            message: 'Your digital marketing campaign is now live! We have set up your Google Ads and social media accounts. You can track progress in your dashboard.',
            timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            channel: 'userpage'
          }
        ],
        submittedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        lastMessageAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    ];
    
    const insertedOrders = await db.collection('serviceOrders').insertMany(orders);
    console.log('\n✅ Service orders created:');
    console.log('   🛒 E-commerce Website ($2,500) - Ready for purchase link');
    console.log('   📱 Mobile App ($3,500) - Ready for purchase link');
    console.log('   📈 Marketing Campaign ($1,200) - Paid and in progress');

    // Create enhanced coupon codes
    const coupons = [
      {
        code: 'WELCOME10',
        description: 'Welcome discount - 10% off your first order',
        discountType: 'percentage',
        discountValue: 10,
        minimumAmount: 100,
        maxUses: 100,
        currentUses: 5,
        expiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: now
      },
      {
        code: 'SAVE50',
        description: 'Fixed discount - $50 off orders over $200',
        discountType: 'fixed',
        discountValue: 50,
        minimumAmount: 200,
        maxUses: 50,
        currentUses: 12,
        expiryDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: now
      },
      {
        code: 'BIGDEAL20',
        description: 'Big Deal - 20% off orders over $1000',
        discountType: 'percentage',
        discountValue: 20,
        minimumAmount: 1000,
        maxUses: 25,
        currentUses: 3,
        expiryDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: now
      },
      {
        code: 'PREMIUM15',
        description: 'Premium service discount - 15% off',
        discountType: 'percentage',
        discountValue: 15,
        minimumAmount: 500,
        maxUses: 30,
        currentUses: 8,
        expiryDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: now
      }
    ];
    
    await db.collection('coupons').insertMany(coupons);
    console.log('\n✅ Coupon codes created:');
    console.log('   🎟️ WELCOME10 (10% off, min $100)');
    console.log('   💰 SAVE50 ($50 off, min $200)');
    console.log('   🔥 BIGDEAL20 (20% off, min $1000)');
    console.log('   ⭐ PREMIUM15 (15% off, min $500)');

    // Generate purchase links for confirmed orders
    const confirmedOrders = orders.filter(order => order.status === 'confirmed');
    const purchaseLinks = [];
    
    for (const order of confirmedOrders) {
      const purchaseToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours
      
      const purchaseLinkData = {
        token: purchaseToken,
        orderId: order._id,
        userEmail: order.userEmail,
        amount: order.totalAmount,
        currency: 'USD',
        createdBy: 'admin@icsrt.com',
        createdAt: now,
        expiresAt: expiresAt,
        isActive: true,
        usageCount: 0,
        maxUsage: 1,
        metadata: {
          serviceName: order.serviceName,
          customerName: order.customerInfo.name,
          customerEmail: order.customerInfo.email
        }
      };
      
      purchaseLinks.push(purchaseLinkData);
      
      // Update service order with purchase link info
      await db.collection('serviceOrders').updateOne(
        { _id: order._id },
        {
          $set: {
            purchaseLink: {
              token: purchaseToken,
              createdAt: now,
              expiresAt: expiresAt,
              createdBy: 'admin@icsrt.com',
              isActive: true
            },
            status: 'ready-for-payment',
            updatedAt: now
          }
        }
      );
    }
    
    if (purchaseLinks.length > 0) {
      await db.collection('purchaseLinks').insertMany(purchaseLinks);
      console.log('\n🔗 Purchase links generated:');
      
      purchaseLinks.forEach((link, index) => {
        const url = `http://localhost:3002/purchase/${link.token}`;
        console.log(`   ${index + 1}. ${link.metadata.serviceName}: ${url}`);
      });
    }

    console.log('\n🎯 Dashboard Access:');
    console.log('   🖥️  Admin Dashboard: http://localhost:3001');
    console.log('   👤 User Page: http://localhost:3002');
    console.log('   🔧 API Server: http://localhost:3000');

    console.log('\n📋 Test Scenarios:');
    console.log('   1. Login to dashboard as admin@icsrt.com');
    console.log('   2. View Service Orders - see "Pay Link" buttons');
    console.log('   3. Generate new purchase links');
    console.log('   4. Test purchase links in incognito mode');
    console.log('   5. Login to user page and see purchase link buttons');

    console.log('\n🚀 System Ready for Testing!\n');
    
    return {
      users: users.length,
      orders: orders.length,
      coupons: coupons.length,
      purchaseLinks: purchaseLinks.length,
      testUrls: purchaseLinks.map(link => `http://localhost:3002/purchase/${link.token}`)
    };

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  } finally {
    await client.close();
  }
}

module.exports = { createEnhancedTestData };
