const http = require('http');
const { MongoClient } = require('mongodb');

class ICSRTSystemMonitor {
  constructor() {
    this.API_BASE = 'http://localhost:3000';
    this.DASHBOARD_URL = 'http://localhost:3001';
    this.USERPAGE_URL = 'http://localhost:3002';
    this.MONGO_URI = 'mongodb+srv://icsrt:Rawan2024@cluster0.mongodb.net/icsrt_main?retryWrites=true&w=majority';
  }

  async checkService(port, name) {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 2000
      }, (res) => {
        resolve({ name, port, status: '🟢 Running', statusCode: res.statusCode });
      });
      
      req.on('error', () => {
        resolve({ name, port, status: '🔴 Stopped', error: true });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ name, port, status: '🟡 Timeout', timeout: true });
      });
      
      req.end();
    });
  }

  async checkDatabase() {
    try {
      const client = new MongoClient(this.MONGO_URI);
      await client.connect();
      const db = client.db('icsrt_main');
      
      // Check collections and count data
      const users = await db.collection('users').countDocuments();
      const orders = await db.collection('serviceOrders').countDocuments();
      const coupons = await db.collection('coupons').countDocuments();
      const purchaseLinks = await db.collection('purchaseLinks').countDocuments();
      const activePurchaseLinks = await db.collection('purchaseLinks').countDocuments({ 
        isActive: true, 
        expiresAt: { $gt: new Date() } 
      });
      
      await client.close();
      
      return {
        status: '🟢 Connected',
        data: { users, orders, coupons, purchaseLinks, activePurchaseLinks }
      };
    } catch (error) {
      return {
        status: '🔴 Error',
        error: error.message
      };
    }
  }

  async testPurchaseLinks() {
    try {
      const client = new MongoClient(this.MONGO_URI);
      await client.connect();
      const db = client.db('icsrt_main');
      
      const activeLinks = await db.collection('purchaseLinks')
        .find({ 
          isActive: true, 
          expiresAt: { $gt: new Date() } 
        })
        .limit(3)
        .toArray();
      
      await client.close();
      
      return activeLinks.map(link => ({
        token: link.token.substring(0, 8) + '...',
        amount: `$${link.amount} ${link.currency}`,
        service: link.metadata.serviceName,
        customer: link.metadata.customerName,
        expires: new Date(link.expiresAt).toLocaleString(),
        url: `http://localhost:3002/purchase/${link.token}`
      }));
    } catch (error) {
      return [];
    }
  }

  async generateReport() {
    console.log('\n🔍 ICSRT++ System Status Monitor');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Check services
    console.log('📊 SERVICE STATUS:');
    const services = [
      await this.checkService(3000, 'Backend API'),
      await this.checkService(3001, 'Admin Dashboard'),
      await this.checkService(3002, 'User Page')
    ];

    services.forEach(service => {
      console.log(`   ${service.status} ${service.name} (Port ${service.port})`);
    });

    // Check database
    console.log('\n💾 DATABASE STATUS:');
    const dbStatus = await this.checkDatabase();
    console.log(`   ${dbStatus.status} MongoDB Atlas Connection`);
    
    if (dbStatus.data) {
      console.log(`   📊 Data Summary:`);
      console.log(`      👥 Users: ${dbStatus.data.users}`);
      console.log(`      📦 Service Orders: ${dbStatus.data.orders}`);
      console.log(`      🎟️  Coupons: ${dbStatus.data.coupons}`);
      console.log(`      🔗 Total Purchase Links: ${dbStatus.data.purchaseLinks}`);
      console.log(`      ✅ Active Purchase Links: ${dbStatus.data.activePurchaseLinks}`);
    }

    // Test purchase links
    console.log('\n🔗 ACTIVE PURCHASE LINKS:');
    const purchaseLinks = await this.testPurchaseLinks();
    
    if (purchaseLinks.length > 0) {
      purchaseLinks.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.service} (${link.amount})`);
        console.log(`      Customer: ${link.customer}`);
        console.log(`      Token: ${link.token}`);
        console.log(`      Expires: ${link.expires}`);
        console.log(`      URL: ${link.url}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  No active purchase links found');
      console.log('   💡 Run the enhanced demo script to create test data');
    }

    // System health summary
    console.log('🎯 SYSTEM HEALTH SUMMARY:');
    const allServicesRunning = services.every(s => s.status.includes('🟢'));
    const dbConnected = dbStatus.status.includes('🟢');
    const hasTestData = dbStatus.data && dbStatus.data.users > 0;
    const hasPurchaseLinks = purchaseLinks.length > 0;

    if (allServicesRunning && dbConnected && hasTestData && hasPurchaseLinks) {
      console.log('   🎉 ALL SYSTEMS OPERATIONAL!');
      console.log('   ✅ Services running, database connected, test data loaded');
      console.log('   🚀 Purchase link system fully functional');
      console.log('\n📋 READY FOR TESTING:');
      console.log(`   🖥️  Admin: ${this.DASHBOARD_URL} (admin@icsrt.com / admin123)`);
      console.log(`   👤 User: ${this.USERPAGE_URL} (testuser@icsrt.com / password123)`);
      console.log('   🎟️  Coupons: WELCOME10, SAVE50, BIGDEAL20, PREMIUM15');
    } else {
      console.log('   ⚠️  SYSTEM ISSUES DETECTED:');
      if (!allServicesRunning) console.log('   🔴 Some services are not running');
      if (!dbConnected) console.log('   🔴 Database connection failed');
      if (!hasTestData) console.log('   🔴 No test data found');
      if (!hasPurchaseLinks) console.log('   🔴 No active purchase links');
      console.log('\n💡 RUN: ENHANCED-DEMO-START.bat to fix all issues');
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
  }
}

// Auto-run if called directly
if (require.main === module) {
  const monitor = new ICSRTSystemMonitor();
  monitor.generateReport().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('❌ Monitor error:', error);
    process.exit(1);
  });
}

module.exports = ICSRTSystemMonitor;
