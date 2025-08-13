const express = require('express');
const cors = require('cors');
const { socialLinksAPI } = require('./social-links-module');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('🔄 Testing Social Links API...');

// Test the social links API endpoints
app.get('/api/social-links', socialLinksAPI.getAll);
app.get('/api/social-links/:id', socialLinksAPI.getById);
app.post('/api/social-links', socialLinksAPI.create);
app.put('/api/social-links/:id', socialLinksAPI.update);
app.delete('/api/social-links/:id', socialLinksAPI.delete);

// Test endpoint to verify server is running
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Social Links API Test Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Social Links Test Server running on http://localhost:${PORT}`);
  console.log(`📡 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🔗 Social Links API: http://localhost:${PORT}/api/social-links`);
  
  // Test the API immediately
  setTimeout(async () => {
    try {
      console.log('\n🧪 Testing API endpoints...');
      
      // Test GET all social links
      const mockReq = {};
      const mockRes = {
        json: (data) => {
          console.log('✅ GET /api/social-links response:', JSON.stringify(data, null, 2));
        },
        status: (code) => ({
          json: (data) => {
            console.log(`❌ Error ${code}:`, JSON.stringify(data, null, 2));
          }
        })
      };
      
      await socialLinksAPI.getAll(mockReq, mockRes);
      
    } catch (error) {
      console.error('❌ API test failed:', error);
    }
  }, 1000);
});

module.exports = app;
