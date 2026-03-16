// Simple standalone social media server for testing
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3010; // Different port to avoid conflicts

// CORS setup
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

app.use(express.json());

// In-memory storage for testing
let socialLinks = [
  {
    _id: '1',
    platform: 'facebook',
    url: 'https://facebook.com/icsrt',
    icon: 'fab fa-facebook',
    label: 'Facebook',
    enabled: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    platform: 'twitter',
    url: 'https://twitter.com/icsrt',
    icon: 'fab fa-twitter',
    label: 'Twitter',
    enabled: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    platform: 'linkedin',
    url: 'https://linkedin.com/company/icsrt',
    icon: 'fab fa-linkedin',
    label: 'LinkedIn',
    enabled: true,
    order: 3,
    createdAt: new Date().toISOString()
  }
];

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Social Media Test Server is working!',
    endpoints: [
      'GET /api/social-links',
      'POST /api/social-links',
      'PUT /api/social-links/:id',
      'DELETE /api/social-links/:id'
    ]
  });
});

// Get all social links
app.get('/api/social-links', (req, res) => {
  console.log('📋 GET /api/social-links - Returning', socialLinks.length, 'links');
  res.json({
    success: true,
    data: socialLinks.sort((a, b) => a.order - b.order)
  });
});

// Get single social link
app.get('/api/social-links/:id', (req, res) => {
  const link = socialLinks.find(l => l._id === req.params.id);
  if (!link) {
    return res.status(404).json({
      success: false,
      error: 'Social link not found'
    });
  }
  res.json({
    success: true,
    data: link
  });
});

// Create new social link
app.post('/api/social-links', (req, res) => {
  const { platform, url, icon, label, enabled = true, order } = req.body;

  console.log('➕ POST /api/social-links - Creating:', { platform, url, label });

  if (!platform || !url) {
    return res.status(400).json({
      success: false,
      error: 'Platform and URL are required'
    });
  }

  const newLink = {
    _id: Date.now().toString(),
    platform: platform.toLowerCase(),
    url,
    icon: icon || `fab fa-${platform.toLowerCase()}`,
    label: label || platform,
    enabled,
    order: order || socialLinks.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  socialLinks.push(newLink);

  res.status(201).json({
    success: true,
    message: 'Social link created successfully',
    data: newLink
  });
});

// Update social link
app.put('/api/social-links/:id', (req, res) => {
  const linkIndex = socialLinks.findIndex(l => l._id === req.params.id);

  if (linkIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Social link not found'
    });
  }

  socialLinks[linkIndex] = {
    ...socialLinks[linkIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  console.log('✏️ PUT /api/social-links/:id - Updated link:', socialLinks[linkIndex].platform);

  res.json({
    success: true,
    message: 'Social link updated successfully'
  });
});

// Delete social link
app.delete('/api/social-links/:id', (req, res) => {
  const linkIndex = socialLinks.findIndex(l => l._id === req.params.id);

  if (linkIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Social link not found'
    });
  }

  const deletedLink = socialLinks.splice(linkIndex, 1)[0];

  console.log('🗑️ DELETE /api/social-links/:id - Deleted:', deletedLink.platform);

  res.json({
    success: true,
    message: 'Social link deleted successfully'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🧪 Social Media Test Server running on http://localhost:${port}`);
  console.log(`📋 Test endpoints:`);
  console.log(`   GET  http://localhost:${port}/test`);
  console.log(`   GET  http://localhost:${port}/api/social-links`);
  console.log(`   POST http://localhost:${port}/api/social-links`);
  console.log('');
  console.log('🎯 To test with dashboard:');
  console.log('   1. Update API_BASE_URL in SocialMediaManagement.jsx to:', `http://localhost:${port}`);
  console.log('   2. Restart dashboard');
  console.log('   3. Navigate to Social Media section');
  console.log('');
  console.log('📊 Current test data:', socialLinks.length, 'social links loaded');
});

// Error handling
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

  