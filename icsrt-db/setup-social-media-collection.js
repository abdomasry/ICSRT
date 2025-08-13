const { MongoClient } = require("mongodb");

// MongoDB connection
const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function setupSocialMediaCollection() {
  let client;
  
  try {
    console.log("🔗 Setting up Social Media Collection...");
    console.log("📡 Connecting to MongoDB...");
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    console.log("✅ Connected to MongoDB!");
    
    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const socialLinksCollection = collections.find(col => col.name === 'social_links');
    
    if (socialLinksCollection) {
      console.log("📋 Social links collection already exists");
    } else {
      console.log("📝 Creating social_links collection...");
      await db.createCollection('social_links');
      console.log("✅ Collection created!");
    }
    
    // Create indexes for better performance
    console.log("🔧 Creating indexes...");
    await db.collection('social_links').createIndex({ order: 1 });
    await db.collection('social_links').createIndex({ enabled: -1 });
    await db.collection('social_links').createIndex({ createdAt: 1 });
    console.log("✅ Indexes created!");
    
    // Check existing data
    const existingLinks = await db.collection('social_links').countDocuments();
    console.log(`📊 Found ${existingLinks} existing social media links`);
    
    if (existingLinks === 0) {
      console.log("📝 Adding default social media links...");
      
      const defaultSocialLinks = [
        {
          platform: 'facebook',
          url: 'https://facebook.com/icsrt',
          icon: 'fab fa-facebook',
          label: 'Facebook',
          enabled: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system-setup'
        },
        {
          platform: 'twitter',
          url: 'https://twitter.com/icsrt',
          icon: 'fab fa-twitter',
          label: 'Twitter',
          enabled: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system-setup'
        },
        {
          platform: 'instagram',
          url: 'https://instagram.com/icsrt',
          icon: 'fab fa-instagram',
          label: 'Instagram',
          enabled: true,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system-setup'
        },
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/company/icsrt',
          icon: 'fab fa-linkedin',
          label: 'LinkedIn',
          enabled: true,
          order: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system-setup'
        },
        {
          platform: 'youtube',
          url: 'https://youtube.com/@icsrt',
          icon: 'fab fa-youtube',
          label: 'YouTube',
          enabled: true,
          order: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system-setup'
        }
      ];
      
      const result = await db.collection('social_links').insertMany(defaultSocialLinks);
      console.log(`✅ Added ${result.insertedCount} default social media links`);
      
      // List the created links
      console.log("\n📋 Default social media links created:");
      defaultSocialLinks.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.label} (${link.platform}) - ${link.url}`);
      });
    } else {
      console.log("📢 Using existing social media links");
      
      // Show existing links
      const existingLinksData = await db.collection('social_links')
        .find({})
        .sort({ order: 1 })
        .toArray();
      
      console.log("\n📋 Existing social media links:");
      existingLinksData.forEach((link, index) => {
        const status = link.enabled ? '✅' : '❌';
        console.log(`   ${index + 1}. ${status} ${link.label} (${link.platform}) - ${link.url}`);
      });
    }
    
    console.log("\n🎯 Social Media Management System Status:");
    console.log("   ✅ Database collection: social_links");
    console.log("   ✅ Indexes: order, enabled, createdAt");
    console.log("   ✅ Sample data: Available");
    console.log("   ✅ API endpoints: Added to server.js");
    
    console.log("\n📱 Next Steps:");
    console.log("1. Restart your server: cd icsrt-db && node server.js");
    console.log("2. Start dashboard: cd icsrt-dashboard && npm start");
    console.log("3. Navigate to 'Social Media' in dashboard sidebar");
    console.log("4. Update URLs with your actual social media accounts");
    console.log("5. Check user page footer for social links display");
    
  } catch (error) {
    console.error("❌ Error setting up social media collection:", error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log("📊 Database connection closed.");
    }
  }
}

// Run the setup script
if (require.main === module) {
  setupSocialMediaCollection()
    .then(() => {
      console.log("\n🎉 Social Media Collection setup completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Setup failed:", error);
      process.exit(1);
    });
}

module.exports = { setupSocialMediaCollection };
