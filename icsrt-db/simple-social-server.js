const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string - using your icsrt_main database
const MONGODB_URI = 'mongodb+srv://abdoelgazar8:gTiOGU8QbNwhAXAZ@cluster0.btcbh.mongodb.net/icsrt_main?retryWrites=true&w=majority';

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Global database connection
let client;
let database;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    database = client.db('icsrt_main');
    console.log('✅ Connected to MongoDB Atlas (icsrt_main)');
    
    // Initialize social links
    await initializeSocialLinks();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Initialize social links collection and data
async function initializeSocialLinks() {
  try {
    console.log('🔧 Initializing social_links collection...');
    
    // Check if collection exists
    const collections = await database.listCollections().toArray();
    const socialLinksExists = collections.find(col => col.name === 'social_links');
    
    if (!socialLinksExists) {
      console.log('📝 Creating social_links collection...');
      await database.createCollection('social_links');
    } else {
      console.log('✅ social_links collection already exists');
    }
    
    // Create indexes
    await database.collection('social_links').createIndex({ order: 1 });
    await database.collection('social_links').createIndex({ enabled: -1 });
    
    // Check existing data
    const count = await database.collection('social_links').countDocuments();
    console.log(`📊 Found ${count} existing social links`);
    
    if (count === 0) {
      console.log('🌱 Adding default social links...');
      
      const defaultLinks = [
        {
          platform: 'Facebook',
          url: 'https://facebook.com/icsrt',
          icon: 'fab fa-facebook',
          label: 'Facebook',
          enabled: true,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          platform: 'Twitter',
          url: 'https://twitter.com/icsrt',
          icon: 'fab fa-twitter',
          label: 'Twitter',
          enabled: true,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          platform: 'LinkedIn',
          url: 'https://linkedin.com/company/icsrt',
          icon: 'fab fa-linkedin',
          label: 'LinkedIn',
          enabled: true,
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          platform: 'Instagram',
          url: 'https://instagram.com/icsrt',
          icon: 'fab fa-instagram',
          label: 'Instagram',
          enabled: true,
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await database.collection('social_links').insertMany(defaultLinks);
      console.log('✅ Default social links added successfully!');
    }
    
    console.log('🎉 Social links system ready!');
  } catch (error) {
    console.error('❌ Error initializing social links:', error);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: database ? 'connected' : 'disconnected',
    collection: 'social_links'
  });
});

// ==========================================
// SOCIAL LINKS API ENDPOINTS
// Using /api/social-links (with dash) as expected by dashboard
// But storing in social_links (with underscore) collection
// ==========================================

// GET all social links
app.get('/api/social-links', async (req, res) => {
  try {
    console.log('📡 GET /api/social-links - Fetching all social links');
    
    const socialLinks = await database.collection('social_links')
      .find({})
      .sort({ order: 1 })
      .toArray();
    
    console.log(`✅ Found ${socialLinks.length} social links`);
    
    res.json({
      success: true,
      data: socialLinks,
      count: socialLinks.length
    });
  } catch (error) {
    console.error('❌ Error fetching social links:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch social links'
    });
  }
});

// GET single social link
app.get('/api/social-links/:id', async (req, res) => {
  try {
    console.log(`📡 GET /api/social-links/${req.params.id}`);
    
    const socialLink = await database.collection('social_links').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!socialLink) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
    }
    
    res.json({
      success: true,
      data: socialLink
    });
  } catch (error) {
    console.error('❌ Error fetching social link:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST new social link
app.post('/api/social-links', async (req, res) => {
  try {
    console.log('📡 POST /api/social-links - Creating new social link');
    console.log('📝 Data:', req.body);
    
    const { platform, url, icon, label, enabled } = req.body;
    
    // Validation
    if (!platform || !url) {
      return res.status(400).json({
        success: false,
        message: 'Platform and URL are required'
      });
    }
    
    // Get next order number
    const lastLink = await database.collection('social_links')
      .findOne({}, { sort: { order: -1 } });
    const nextOrder = lastLink ? lastLink.order + 1 : 1;
    
    const newSocialLink = {
      platform,
      url,
      icon: icon || `fab fa-${platform.toLowerCase()}`,
      label: label || platform,
      enabled: enabled !== undefined ? enabled : true,
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await database.collection('social_links').insertOne(newSocialLink);
    
    console.log('✅ Social link created with ID:', result.insertedId);
    
    res.status(201).json({
      success: true,
      message: 'Social link created successfully',
      data: {
        _id: result.insertedId,
        ...newSocialLink
      }
    });
  } catch (error) {
    console.error('❌ Error creating social link:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create social link'
    });
  }
});

// PUT update social link
app.put('/api/social-links/:id', async (req, res) => {
  try {
    console.log(`📡 PUT /api/social-links/${req.params.id}`);
    console.log('📝 Update data:', req.body);
    
    const { platform, url, icon, label, enabled, order } = req.body;
    
    const updateData = {
      platform: platform,
      url: url,
      icon: icon || `fab fa-${platform.toLowerCase()}`,
      label: label || platform,
      enabled: enabled !== undefined ? enabled : true,
      updatedAt: new Date()
    };
    
    if (order !== undefined) {
      updateData.order = order;
    }
    
    const result = await database.collection('social_links').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
    }
    
    console.log('✅ Social link updated successfully');
    
    res.json({
      success: true,
      message: 'Social link updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating social link:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE social link
app.delete('/api/social-links/:id', async (req, res) => {
  try {
    console.log(`📡 DELETE /api/social-links/${req.params.id}`);
    
    const result = await database.collection('social_links').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
    }
    
    console.log('✅ Social link deleted successfully');
    
    res.json({
      success: true,
      message: 'Social link deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting social link:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT reorder social links
app.put('/api/social-links/reorder', async (req, res) => {
  try {
    console.log('📡 PUT /api/social-links/reorder');
    const { links } = req.body;
    
    if (!Array.isArray(links)) {
      return res.status(400).json({
        success: false,
        message: 'Links array is required'
      });
    }
    
    const bulkOps = links.map((link, index) => ({
      updateOne: {
        filter: { _id: new ObjectId(link._id) },
        update: { $set: { order: index + 1, updatedAt: new Date() } }
      }
    }));
    
    if (bulkOps.length > 0) {
      await database.collection('social_links').bulkWrite(bulkOps);
    }
    
    console.log('✅ Social links reordered successfully');
    
    res.json({
      success: true,
      message: 'Social links reordered successfully'
    });
  } catch (error) {
    console.error('❌ Error reordering social links:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (client) {
    await client.close();
    console.log('📄 Database connection closed');
  }
  process.exit(0);
});

// Start server
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀==================================================🚀');
    console.log('🎉        ICSRT SOCIAL LINKS SERVER READY         🎉');
    console.log('🚀==================================================🚀');
    console.log('');
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`📱 API Base: http://localhost:${PORT}/api`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('📋 API Endpoints:');
    console.log('  • GET    /api/social-links          - Get all social links');
    console.log('  • GET    /api/social-links/:id      - Get single social link');
    console.log('  • POST   /api/social-links          - Create new social link');
    console.log('  • PUT    /api/social-links/:id      - Update social link');
    console.log('  • DELETE /api/social-links/:id      - Delete social link');
    console.log('  • PUT    /api/social-links/reorder  - Reorder social links');
    console.log('');
    console.log('💾 Database: social_links collection in icsrt_main');
    console.log('🎯 Dashboard: http://localhost:3001/social-media');
    console.log('');
    console.log('✨ Ready to manage social media links!');
    console.log('');
  });
}

// Start the server
startServer().catch(console.error);
