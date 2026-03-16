const fetch = require('node-fetch');
const { MongoClient } = require("mongodb");

// MongoDB connection
const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

console.log("🔧 ICSRT Social Links API Test & Setup");
console.log("=====================================\n");

async function testServerConnection() {
  try {
    console.log("1. 🔍 Testing server connection...");
    const response = await fetch('http://localhost:3000/api/health', { timeout: 5000 });
    const data = await response.json();
    console.log("✅ Server is running!");
    console.log("📊 Server status:", data);
    return true;
  } catch (error) {
    console.log("❌ Server is not running:", error.message);
    console.log("💡 Please start the server with: node server.js");
    return false;
  }
}

async function testSocialLinksAPI() {
  try {
    console.log("\n2. 🔗 Testing social links API...");
    const response = await fetch('http://localhost:3000/api/social-links', { timeout: 5000 });
    const data = await response.json();
    
    if (data.success) {
      console.log("✅ Social links API is working!");
      console.log(`📋 Found ${data.data?.length || 0} social links`);
      if (data.data && data.data.length > 0) {
        console.log("📌 Existing social links:");
        data.data.forEach(link => {
          console.log(`   - ${link.label} (${link.platform}): ${link.url} [${link.enabled ? 'Enabled' : 'Disabled'}]`);
        });
      }
      return { success: true, data: data.data };
    } else {
      console.log("❌ Social links API error:", data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log("❌ Failed to connect to social links API:", error.message);
    return { success: false, error: error.message };
  }
}

async function setupSocialLinksCollection() {
  let client;
  
  try {
    console.log("\n3. 🗃️ Setting up social links collection...");
    
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
      console.log(`✅ Added ${result.insertedCount} default social media links!`);
    }
    
    return true;
  } catch (error) {
    console.log("❌ Database setup failed:", error.message);
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function testCreateNewLink() {
  try {
    console.log("\n4. ➕ Testing create new social link...");
    
    const newLink = {
      platform: 'whatsapp',
      url: 'https://wa.me/1234567890',
      icon: 'fab fa-whatsapp',
      label: 'WhatsApp',
      enabled: true,
      order: 6
    };
    
    const response = await fetch('http://localhost:3000/api/social-links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLink)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log("✅ Successfully created test social link!");
      console.log("📌 Created:", data.data);
      return data.data;
    } else {
      console.log("❌ Failed to create social link:", data.error);
      return null;
    }
  } catch (error) {
    console.log("❌ Error creating social link:", error.message);
    return null;
  }
}

async function testDeleteLink(linkId) {
  if (!linkId) return;
  
  try {
    console.log("\n5. 🗑️ Testing delete social link...");
    
    const response = await fetch(`http://localhost:3000/api/social-links/${linkId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log("✅ Successfully deleted test social link!");
    } else {
      console.log("❌ Failed to delete social link:", data.error);
    }
  } catch (error) {
    console.log("❌ Error deleting social link:", error.message);
  }
}

async function main() {
  // Test server connection
  const serverRunning = await testServerConnection();
  
  if (!serverRunning) {
    console.log("\n🚨 Server is not running! Please start it first:");
    console.log("   cd icsrt-db");
    console.log("   node server.js");
    process.exit(1);
  }
  
  // Test API directly
  const apiTest = await testSocialLinksAPI();
  
  if (!apiTest.success) {
    console.log("\n🔧 API not working, setting up database collection...");
    const setupSuccess = await setupSocialLinksCollection();
    
    if (setupSuccess) {
      console.log("\n🔄 Retesting API after setup...");
      await testSocialLinksAPI();
    }
  }
  
  // Test CRUD operations
  const newLink = await testCreateNewLink();
  if (newLink && newLink._id) {
    await testDeleteLink(newLink._id);
  }
  
  console.log("\n🎉 Social Links API Testing Complete!");
  console.log("\n📋 To access the dashboard:");
  console.log("   1. Open: http://localhost:3001");
  console.log("   2. Navigate to 'Social Media' in the sidebar");
  console.log("   3. Manage your social media links");
  console.log("\n📄 API Endpoint: http://localhost:3000/api/social-links");
}

// Run the test
main().catch(console.error);
