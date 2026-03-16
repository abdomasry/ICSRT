const { MongoClient } = require("mongodb");

// MongoDB connection
const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function createDefaultSocialLinks() {
  let client;
  
  try {
    console.log("🔗 Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // Default social media links
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
        createdBy: 'system'
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
        createdBy: 'system'
      },
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/company/icsrt',
        icon: 'fab fa-linkedin',
        label: 'LinkedIn',
        enabled: true,
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        platform: 'instagram',
        url: 'https://instagram.com/icsrt',
        icon: 'fab fa-instagram',
        label: 'Instagram',
        enabled: true,
        order: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
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
        createdBy: 'system'
      }
    ];
    
    // Check if social links already exist
    const existingLinksCount = await db.collection('social_links').countDocuments();
    
    if (existingLinksCount > 0) {
      console.log(`📢 Found ${existingLinksCount} existing social links. Skipping default creation.`);
      console.log("✅ Use the dashboard to manage existing social links or delete them first.");
      return;
    }
    
    // Insert default social links
    console.log("📝 Creating default social media links...");
    const result = await db.collection('social_links').insertMany(defaultSocialLinks);
    
    console.log(`✅ Successfully created ${result.insertedCount} default social media links:`);
    defaultSocialLinks.forEach((link, index) => {
      console.log(`   ${index + 1}. ${link.label} (${link.platform})`);
    });
    
    console.log("\n🎯 Next steps:");
    console.log("1. Start your dashboard server: cd icsrt-dashboard && npm start");
    console.log("2. Navigate to Social Media Management in the dashboard");
    console.log("3. Update the URLs to match your actual social media accounts");
    console.log("4. Add or remove platforms as needed");
    console.log("5. Check the userpage to see the social links in action");
    
  } catch (error) {
    console.error("❌ Error creating default social links:", error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log("📊 Database connection closed.");
    }
  }
}

// Run the script
if (require.main === module) {
  createDefaultSocialLinks()
    .then(() => {
      console.log("🎉 Default social links setup completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Setup failed:", error);
      process.exit(1);
    });
}

module.exports = { createDefaultSocialLinks };
