// Fixed server.js for contact requests
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// MongoDB Configuration - Updated based on your database
const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

let mongoClient;

// Initialize MongoDB connection
async function initializeDatabase() {
  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📊 Database: ${DATABASE_NAME}`);
    
    // Test the connection and check for contact data
    const db = mongoClient.db(DATABASE_NAME);
    
    // Check both possible collection names
    const underscoreCount = await db.collection('contact_requests').countDocuments();
    const hyphenCount = await db.collection('contact-requests').countDocuments();
    
    console.log(`📋 contact_requests: ${underscoreCount} documents`);
    console.log(`📋 contact-requests: ${hyphenCount} documents`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Contact API endpoint - Fixed version
app.get('/api/contacts', async (req, res) => {
  console.log('📞 Contact API called at:', new Date().toISOString());
  
  try {
    if (!mongoClient) {
      throw new Error('Database not connected');
    }
    
    const db = mongoClient.db(DATABASE_NAME);
    
    // Try to get contacts from contact_requests first (underscore)
    let contacts = await db.collection('contact_requests').find({}).sort({ createdAt: -1 }).toArray();
    
    // If no data, try contact-requests (hyphen)
    if (contacts.length === 0) {
      contacts = await db.collection('contact-requests').find({}).sort({ createdAt: -1 }).toArray();
    }
    
    // If still no data, try just 'contacts'
    if (contacts.length === 0) {
      contacts = await db.collection('contacts').find({}).sort({ createdAt: -1 }).toArray();
    }
    
    console.log(`📊 Found ${contacts.length} contact requests`);
    
    // Ensure proper data structure for dashboard
    const formattedContacts = contacts.map(contact => ({
      _id: contact._id,
      name: contact.name || 'Unknown',
      email: contact.email || 'No email',
      subject: contact.subject || 'No subject',
      message: contact.message || 'No message',
      category: contact.category || 'general',
      timestamp: contact.timestamp || contact.createdAt || new Date(),
      createdAt: contact.createdAt || contact.timestamp || new Date(),
      status: contact.status || 'pending'
    }));
    
    res.json({
      success: true,
      data: formattedContacts,
      count: formattedContacts.length
    });
    
  } catch (error) {
    console.error('❌ Contact API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: mongoClient ? 'connected' : 'disconnected'
  });
});

// Start server
async function startServer() {
  const dbConnected = await initializeDatabase();
  
  if (!dbConnected) {
    console.log('⚠️  Starting server without database connection');
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Contact API: http://localhost:${PORT}/api/contacts`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`\n🎯 Dashboard should now be able to fetch contact data!`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (mongoClient) {
    await mongoClient.close();
  }
  process.exit(0);
});

// Start the server
startServer();
