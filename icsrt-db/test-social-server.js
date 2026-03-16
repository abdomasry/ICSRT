const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const port = 3001; // Use different port for testing

// MongoDB configuration
const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3001', // Dashboard
    'http://localhost:3002', // User page
    'http://localhost:3000'  // API itself
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

let db;

async function connectDB() {
  if (!db) {
    console.log("🔗 Connecting to MongoDB...");
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    console.log("✅ Connected to MongoDB!");
  }
  return db;
}

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test server is working!' });
});

// Social media links endpoints
app.get('/api/social-links', async (req, res) => {
  try {
    console.log("📋 Getting social links...");
    const database = await connectDB();
    const socialLinks = await database.collection('social_links')
      .find({})
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    
    console.log(`✅ Found ${socialLinks.length} social links`);
    res.json({
      success: true,
      data: socialLinks
    });
  } catch (error) {
    console.error('❌ Get social links error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social links',
      details: error.message
    });
  }
});

app.post('/api/social-links', async (req, res) => {
  try {
    const { platform, url, icon, label, enabled, order } = req.body;
    
    console.log("➕ Creating social link:", { platform, url, label });
    
    if (!platform || !url) {
      return res.status(400).json({
        success: false,
        error: 'Platform and URL are required'
      });
    }
    
    const database = await connectDB();
    
    // If no order specified, get the next order number
    let finalOrder = order;
    if (finalOrder === undefined) {
      const lastLink = await database.collection('social_links')
        .findOne({}, { sort: { order: -1 } });
      finalOrder = lastLink ? (lastLink.order || 0) + 1 : 1;
    }
    
    const newSocialLink = {
      platform: platform.trim().toLowerCase(),
      url: url.trim(),
      icon: icon || `fab fa-${platform.toLowerCase()}`,
      label: label || platform,
      enabled: enabled !== false,
      order: finalOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test'
    };
    
    const result = await database.collection('social_links').insertOne(newSocialLink);
    
    console.log("✅ Created social link with ID:", result.insertedId);
    res.status(201).json({
      success: true,
      message: 'Social link created successfully',
      data: { ...newSocialLink, _id: result.insertedId }
    });
  } catch (error) {
    console.error('❌ Create social link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create social link',
      details: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Test server running on http://localhost:${port}`);
  console.log(`📋 Test social links: http://localhost:${port}/api/social-links`);
  console.log(`🔧 Test endpoint: http://localhost:${port}/test`);
});

// Create default links after server starts
setTimeout(async () => {
  console.log("\n📝 Creating default social links...");
  
  const defaultLinks = [
    {
      platform: 'facebook',
      url: 'https://facebook.com/icsrt',
      label: 'Facebook',
      enabled: true
    },
    {
      platform: 'twitter',
      url: 'https://twitter.com/icsrt',
      label: 'Twitter',
      enabled: true
    },
    {
      platform: 'linkedin',
      url: 'https://linkedin.com/company/icsrt',
      label: 'LinkedIn',
      enabled: true
    }
  ];
  
  try {
    const database = await connectDB();
    const existingCount = await database.collection('social_links').countDocuments();
    
    if (existingCount === 0) {
      const result = await database.collection('social_links').insertMany(
        defaultLinks.map((link, index) => ({
          ...link,
          platform: link.platform.toLowerCase(),
          icon: `fab fa-${link.platform}`,
          order: index + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        }))
      );
      console.log(`✅ Created ${result.insertedCount} default social links`);
    } else {
      console.log(`📢 Found ${existingCount} existing social links`);
    }
  } catch (error) {
    console.error('❌ Error creating default links:', error);
  }
}, 2000);
