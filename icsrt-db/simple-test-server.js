// Simple test server to verify contact endpoint
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/contacts', (req, res) => {
  console.log('Contact API called');
  
  // Return test data in the format your dashboard expects
  res.json({
    success: true,
    data: [
      {
        _id: 'test1',
        name: 'Test Contact 1',
        email: 'test1@example.com',
        subject: 'Test Subject 1',
        message: 'This is a test message',
        category: 'general',
        timestamp: new Date(),
        createdAt: new Date(),
        status: 'pending'
      },
      {
        _id: 'test2',
        name: 'Test Contact 2',
        email: 'test2@example.com',
        subject: 'Test Subject 2',
        message: 'This is another test message',
        category: 'general',
        timestamp: new Date(),
        createdAt: new Date(),
        status: 'pending'
      }
    ],
    count: 2
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📍 Contact API: http://localhost:${PORT}/api/contacts`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log('\nTry opening http://localhost:3000/api/contacts in your browser');
});

// Keep server running
process.on('SIGINT', () => {
  console.log('\n🛑 Server stopped');
  process.exit(0);
});
