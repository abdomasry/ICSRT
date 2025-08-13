const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

// ICSRT Social Links Server - Standalone version for testing
const app = express();
const PORT = 3000;

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://abdoelgazar8:gTiOGU8QbNwhAXAZ@cluster0.btcbh.mongodb.net/icsrt_main?retryWrites=true&w=majority';

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Database connection
let database;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  database = mongoose.connection.db;
  
  // Initialize social links collection
  initializeSocialLinksCollection();
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
});

// Initialize social links collection
async function initializeSocialLinksCollection() {
  try {
    console.log('🔧 Initializing social_links collection...');
    
    // Check if collection exists
    const collections = await database.listCollections().toArray();
    const socialLinksExists = collections.find(col => col.name === 'social_links');
    
    if (!socialLinksExists) {
      console.log('📝 Creating social_links collection...');
      await database.createCollection('social_links');
    }
    
    // Create indexes
    await database.collection('social_links').createIndex({ order: 1 });
    await database.collection('social_links').createIndex({ enabled: -1 });
    await database.collection('social_links').createIndex({ createdAt: 1 });
    
    // Check if we have any social links
    const existingLinks = await database.collection('social_links').countDocuments();
    console.log(`📊 Found ${existingLinks} existing social links`);
    
    if (existingLinks === 0) {
      console.log('🌱 Adding default social links...');
      const defaultSocialLinks = [
        {
          platform: 'Facebook',
          url: 'https://facebook.com/icsrt',
          label: 'Facebook',
          iconClass: 'fab fa-facebook',
          enabled: true,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          platform: 'Twitter',
          url: 'https://twitter.com/icsrt',
          label: 'Twitter',
          iconClass: 'fab fa-twitter',
          enabled: true,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          platform: 'LinkedIn',
          url: 'https://linkedin.com/company/icsrt',
          label: 'LinkedIn',
          iconClass: 'fab fa-linkedin',
          enabled: true,
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          platform: 'Instagram',
          url: 'https://instagram.com/icsrt',
          label: 'Instagram',
          iconClass: 'fab fa-instagram',
          enabled: true,
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await database.collection('social_links').insertMany(defaultSocialLinks);
      console.log('✅ Default social links added successfully!');
    }
    
    console.log('🎉 Social links collection initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing social links collection:', error);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: database ? 'connected' : 'disconnected'
  });
});

// =====================================================
// SOCIAL LINKS API ENDPOINTS
// =====================================================

// GET all social links
app.get('/api/social-links', async (req, res) => {
  try {
    const socialLinks = await database.collection('social_links')
      .find({})
      .sort({ order: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: socialLinks
    });
  } catch (error) {
    console.error('Error fetching social links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social links',
      error: error.message
    });
  }
});

// GET single social link
app.get('/api/social-links/:id', async (req, res) => {
  try {
    const socialLink = await database.collection('social_links').findOne({ 
      _id: new mongoose.Types.ObjectId(req.params.id) 
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
    console.error('Error fetching social link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social link',
      error: error.message
    });
  }
});

// POST new social link
app.post('/api/social-links', async (req, res) => {
  try {
    const { platform, url, label, iconClass, enabled } = req.body;
    
    // Validation
    if (!platform || !url || !label) {
      return res.status(400).json({
        success: false,
        message: 'Platform, URL, and label are required'
      });
    }
    
    // Get next order number
    const lastLink = await database.collection('social_links')
      .findOne({}, { sort: { order: -1 } });
    const nextOrder = lastLink ? lastLink.order + 1 : 1;
    
    const newSocialLink = {
      platform,
      url,
      label,
      iconClass: iconClass || `fab fa-${platform.toLowerCase()}`,
      enabled: enabled !== undefined ? enabled : true,
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await database.collection('social_links').insertOne(newSocialLink);
    
    res.status(201).json({
      success: true,
      message: 'Social link created successfully',
      data: {
        _id: result.insertedId,
        ...newSocialLink
      }
    });
  } catch (error) {
    console.error('Error creating social link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create social link',
      error: error.message
    });
  }
});

// PUT update social link
app.put('/api/social-links/:id', async (req, res) => {
  try {
    const { platform, url, label, iconClass, enabled, order } = req.body;
    
    // Validation
    if (!platform || !url || !label) {
      return res.status(400).json({
        success: false,
        message: 'Platform, URL, and label are required'
      });
    }
    
    const updateData = {
      platform,
      url,
      label,
      iconClass: iconClass || `fab fa-${platform.toLowerCase()}`,
      enabled: enabled !== undefined ? enabled : true,
      updatedAt: new Date()
    };
    
    if (order !== undefined) {
      updateData.order = order;
    }
    
    const result = await database.collection('social_links').updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Social link updated successfully'
    });
  } catch (error) {
    console.error('Error updating social link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social link',
      error: error.message
    });
  }
});

// DELETE social link
app.delete('/api/social-links/:id', async (req, res) => {
  try {
    const result = await database.collection('social_links').deleteOne({ 
      _id: new mongoose.Types.ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Social link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting social link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete social link',
      error: error.message
    });
  }
});

// PUT reorder social links
app.put('/api/social-links/reorder', async (req, res) => {
  try {
    const { links } = req.body;
    
    if (!Array.isArray(links)) {
      return res.status(400).json({
        success: false,
        message: 'Links array is required'
      });
    }
    
    // Update each link's order
    const bulkOps = links.map((link, index) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(link._id) },
        update: { $set: { order: index + 1, updatedAt: new Date() } }
      }
    }));
    
    if (bulkOps.length > 0) {
      await database.collection('social_links').bulkWrite(bulkOps);
    }
    
    res.json({
      success: true,
      message: 'Social links reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering social links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder social links',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀======================================🚀');
  console.log('🎉  ICSRT SOCIAL LINKS SERVER STARTED  🎉');
  console.log('🚀======================================🚀');
  console.log('');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📱 Social Links API: http://localhost:${PORT}/api/social-links`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log('  • GET    /api/social-links');
  console.log('  • GET    /api/social-links/:id');
  console.log('  • POST   /api/social-links');
  console.log('  • PUT    /api/social-links/:id');
  console.log('  • DELETE /api/social-links/:id');
  console.log('  • PUT    /api/social-links/reorder');
  console.log('');
  console.log('✨ Social Media Management is ready!');
  console.log('🎯 Open your dashboard at: http://localhost:3001');
  console.log('');
});
