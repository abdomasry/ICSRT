// 📱 Social Media Test Data Setup
// This script adds sample social media links for testing the userpage display

const { connectDB } = require('./server.js');

const testSocialLinks = [
  {
    platform: 'facebook',
    url: 'https://facebook.com/icsrt',
    label: 'ICSRT Facebook',
    enabled: true,
    order: 1
  },
  {
    platform: 'twitter',
    url: 'https://twitter.com/icsrt',
    label: 'ICSRT Twitter',
    enabled: true,
    order: 2
  },
  {
    platform: 'linkedin',
    url: 'https://linkedin.com/company/icsrt',
    label: 'ICSRT LinkedIn',
    enabled: true,
    order: 3
  },
  {
    platform: 'instagram',
    url: 'https://instagram.com/icsrt',
    label: 'ICSRT Instagram',
    enabled: true,
    order: 4
  },
  {
    platform: 'youtube',
    url: 'https://youtube.com/c/icsrt',
    label: 'ICSRT YouTube',
    enabled: true,
    order: 5
  },
  {
    platform: 'whatsapp',
    url: 'https://wa.me/1234567890',
    label: 'ICSRT WhatsApp',
    enabled: true,
    order: 6
  }
];

async function setupTestData() {
  try {
    console.log('🔄 Connecting to database...');
    const db = await connectDB();
    
    const collection = db.collection('social-links');
    
    // Check if data already exists
    const existingCount = await collection.countDocuments();
    console.log(`📊 Existing social links: ${existingCount}`);
    
    if (existingCount === 0) {
      console.log('🔧 Adding test social media links...');
      const result = await collection.insertMany(testSocialLinks);
      console.log(`✅ Added ${result.insertedCount} social media links`);
      
      // Display the added links
      const addedLinks = await collection.find({}).toArray();
      console.log('📋 Added social links:');
      addedLinks.forEach(link => {
        console.log(`   - ${link.platform}: ${link.url} (${link.enabled ? 'enabled' : 'disabled'})`);
      });
    } else {
      console.log('ℹ️  Social links already exist. Current links:');
      const existingLinks = await collection.find({}).toArray();
      existingLinks.forEach(link => {
        console.log(`   - ${link.platform}: ${link.url} (${link.enabled ? 'enabled' : 'disabled'})`);
      });
    }
    
    console.log('✅ Social media test data setup complete!');
    console.log('🌐 You can now test the userpage at: http://localhost:3002');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  }
}

// Run the setup
console.log('📱 Setting up Social Media Test Data...');
console.log('=====================================');
setupTestData();
