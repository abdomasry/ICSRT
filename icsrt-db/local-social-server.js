const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Local JSON file for data storage (no database needed)
const dataFile = path.join(__dirname, 'social-links-data.json');

// Initialize local data
function initializeLocalData() {
  try {
    if (!fs.existsSync(dataFile)) {
      console.log('📝 Creating local social links data file...');
      
      const defaultData = {
        social_links: [
          {
            _id: "social_1",
            platform: 'Facebook',
            url: 'https://facebook.com/icsrt',
            icon: 'fab fa-facebook',
            label: 'Facebook',
            enabled: true,
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: "social_2",
            platform: 'Twitter',
            url: 'https://twitter.com/icsrt',
            icon: 'fab fa-twitter',
            label: 'Twitter',
            enabled: true,
            order: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: "social_3",
            platform: 'LinkedIn',
            url: 'https://linkedin.com/company/icsrt',
            icon: 'fab fa-linkedin',
            label: 'LinkedIn',
            enabled: true,
            order: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: "social_4",
            platform: 'Instagram',
            url: 'https://instagram.com/icsrt',
            icon: 'fab fa-instagram',
            label: 'Instagram',
            enabled: true,
            order: 4,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
      
      fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2));
      console.log('✅ Default social links created successfully!');
    } else {
      console.log('✅ Social links data file already exists');
    }
    
    console.log('🎉 Local social links system ready!');
  } catch (error) {
    console.error('❌ Error initializing local data:', error);
  }
}

// Helper functions for data operations
function readData() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { social_links: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

function generateId() {
  return 'social_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'local file storage',
    collection: 'social_links'
  });
});

// ==========================================
// SOCIAL LINKS API ENDPOINTS
// Using /api/social-links (with dash) as expected by dashboard
// But storing in local JSON file
// ==========================================

// GET all social links
app.get('/api/social-links', async (req, res) => {
  try {
    console.log('📡 GET /api/social-links - Fetching all social links');
    
    const data = readData();
    const socialLinks = data.social_links || [];
    
    // Sort by order
    socialLinks.sort((a, b) => a.order - b.order);
    
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
    
    const data = readData();
    const socialLink = data.social_links.find(link => link._id === req.params.id);
    
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
    
    const data = readData();
    
    // Get next order number
    const maxOrder = Math.max(...data.social_links.map(link => link.order || 0), 0);
    const nextOrder = maxOrder + 1;
    
    const newSocialLink = {
      _id: generateId(),
      platform,
      url,
      icon: icon || `fab fa-${platform.toLowerCase()}`,
      label: label || platform,
      enabled: enabled !== undefined ? enabled : true,
      order: nextOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.social_links.push(newSocialLink);
    
    if (writeData(data)) {
      console.log('✅ Social link created with ID:', newSocialLink._id);
      
      res.status(201).json({
        success: true,
        message: 'Social link created successfully',
        data: newSocialLink
      });
    } else {
      throw new Error('Failed to save data');
    }
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
    
    const data = readData();
    const linkIndex = data.social_links.findIndex(link => link._id === req.params.id);
    
    if (linkIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
    }
    
    // Update the link
    data.social_links[linkIndex] = {
      ...data.social_links[linkIndex],
      platform: platform || data.social_links[linkIndex].platform,
      url: url || data.social_links[linkIndex].url,
      icon: icon || data.social_links[linkIndex].icon,
      label: label || data.social_links[linkIndex].label,
      enabled: enabled !== undefined ? enabled : data.social_links[linkIndex].enabled,
      order: order !== undefined ? order : data.social_links[linkIndex].order,
      updatedAt: new Date().toISOString()
    };
    
    if (writeData(data)) {
      console.log('✅ Social link updated successfully');
      
      res.json({
        success: true,
        message: 'Social link updated successfully'
      });
    } else {
      throw new Error('Failed to save data');
    }
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
    
    const data = readData();
    const linkIndex = data.social_links.findIndex(link => link._id === req.params.id);
    
    if (linkIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
    }
    
    // Remove the link
    data.social_links.splice(linkIndex, 1);
    
    if (writeData(data)) {
      console.log('✅ Social link deleted successfully');
      
      res.json({
        success: true,
        message: 'Social link deleted successfully'
      });
    } else {
      throw new Error('Failed to save data');
    }
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
    
    const data = readData();
    
    // Update order for each link
    links.forEach((link, index) => {
      const linkIndex = data.social_links.findIndex(l => l._id === link._id);
      if (linkIndex !== -1) {
        data.social_links[linkIndex].order = index + 1;
        data.social_links[linkIndex].updatedAt = new Date().toISOString();
      }
    });
    
    if (writeData(data)) {
      console.log('✅ Social links reordered successfully');
      
      res.json({
        success: true,
        message: 'Social links reordered successfully'
      });
    } else {
      throw new Error('Failed to save data');
    }
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

// Initialize data and start server
function startServer() {
  // Initialize local data
  initializeLocalData();
  
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀==================================================🚀');
    console.log('🎉     ICSRT SOCIAL LINKS SERVER - LOCAL STORAGE  🎉');
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
    console.log('💾 Storage: Local JSON file (no database needed)');
    console.log('🎯 Dashboard: http://localhost:3001/social-media');
    console.log('');
    console.log('✨ Ready to manage social media links!');
    console.log('💡 No external dependencies - works offline!');
    console.log('');
  });
}

// Start the server
startServer();
