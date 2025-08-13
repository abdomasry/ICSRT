const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection
const MONGODB_URI = "mongodb+srv://abdallah:password123@cluster0.v9wdj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASE_NAME = 'icsrt_database';

let client;
let db;

// Middleware
app.use(cors());
app.use(express.json());

// Utility function for parsing MongoDB ObjectIds
const parseId = (id) => {
  if (!id) return null;
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return new ObjectId(id);
  }
  return id;
};

// Connect to database
async function connectDB() {
  if (!db) {
    try {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DATABASE_NAME);
      console.log(`✅ Connected to MongoDB Atlas - Database: ${DATABASE_NAME}`);
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }
  return db;
}

// === SOCIAL MEDIA ENDPOINTS ===

// Get all social media links
app.get('/api/social-links', async (req, res) => {
  try {
    const database = await connectDB();
    const socialLinks = await database.collection('social_links')
      .find({})
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    
    console.log(`📱 Returning ${socialLinks.length} social media links`);
    res.json({
      success: true,
      data: socialLinks
    });
  } catch (error) {
    console.error('❌ Get social links error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social links',
      code: 'FETCH_ERROR'
    });
  }
});

// Create new social media link
app.post('/api/social-links', async (req, res) => {
  try {
    const { platform, url, icon, label, enabled, order } = req.body;
    
    console.log('📝 Creating social media link:', req.body);
    
    if (!platform || !url) {
      return res.status(400).json({
        success: false,
        error: 'Platform and URL are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
        code: 'INVALID_URL'
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
      createdBy: 'dashboard'
    };
    
    const result = await database.collection('social_links').insertOne(newSocialLink);
    console.log('✅ Social media link created:', result.insertedId);
    
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
      code: 'CREATE_ERROR'
    });
  }
});

// Update social media link
app.put('/api/social-links/:id', async (req, res) => {
  try {
    const { platform, url, icon, label, enabled, order } = req.body;
    
    console.log('📝 Updating social media link:', req.params.id, req.body);
    
    const updateData = {
      updatedAt: new Date().toISOString(),
      updatedBy: 'dashboard'
    };
    
    if (platform) updateData.platform = platform.trim().toLowerCase();
    if (url) {
      try {
        new URL(url);
        updateData.url = url.trim();
      } catch (urlError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format',
          code: 'INVALID_URL'
        });
      }
    }
    if (icon !== undefined) updateData.icon = icon;
    if (label !== undefined) updateData.label = label;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (order !== undefined) updateData.order = order;
    
    const database = await connectDB();
    const result = await database.collection('social_links').updateOne(
      { _id: parseId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Social link not found',
        code: 'NOT_FOUND'
      });
    }
    
    console.log('✅ Social media link updated');
    res.json({
      success: true,
      message: 'Social link updated successfully'
    });
  } catch (error) {
    console.error('❌ Update social link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update social link',
      code: 'UPDATE_ERROR'
    });
  }
});

// Delete social media link
app.delete('/api/social-links/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting social media link:', req.params.id);
    
    const database = await connectDB();
    const result = await database.collection('social_links').deleteOne({ 
      _id: parseId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Social link not found',
        code: 'NOT_FOUND'
      });
    }
    
    console.log('✅ Social media link deleted');
    res.json({
      success: true,
      message: 'Social link deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete social link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete social link',
      code: 'DELETE_ERROR'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: DATABASE_NAME,
    endpoints: [
      'GET /api/social-links',
      'POST /api/social-links',
      'PUT /api/social-links/:id',
      'DELETE /api/social-links/:id'
    ]
  });
});

// Error handling
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/social-links',
      'POST /api/social-links',
      'PUT /api/social-links/:id',
      'DELETE /api/social-links/:id'
    ]
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(port, () => {
      console.log(`🚀 ICSRT Social Media API Server running on port ${port}`);
      console.log(`📋 API Health: http://localhost:${port}/api/health`);
      console.log(`📱 Social Links: http://localhost:${port}/api/social-links`);
      console.log('\n✅ Available endpoints:');
      console.log('   - GET /api/health (Server health check)');
      console.log('   - GET /api/social-links (Get all social media links)');
      console.log('   - POST /api/social-links (Create new social media link)');
      console.log('   - PUT /api/social-links/:id (Update social media link)');
      console.log('   - DELETE /api/social-links/:id (Delete social media link)');
      console.log('\n🎯 Try the dashboard Contact Info section now!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
