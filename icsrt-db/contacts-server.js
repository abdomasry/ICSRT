const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

// MongoDB connection
const uri = 'mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority';
let database;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  if (!database) {
    const client = new MongoClient(uri);
    await client.connect();
    database = client.db('icsrt_main');
    console.log('📂 Connected to MongoDB');
  }
  return database;
}

// Parse ObjectId helper
function parseId(id) {
  try {
    return new ObjectId(id);
  } catch (error) {
    throw new Error('Invalid ID format');
  }
}

// === CONTACT MESSAGES ENDPOINTS ===

// Get all contact messages
app.get('/api/contacts', async (req, res) => {
  try {
    const database = await connectDB();
    const contacts = await database.collection('contact-requests')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('❌ Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact messages',
      code: 'FETCH_ERROR'
    });
  }
});

// Create new contact message
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, subject, and message are required'
      });
    }
    
    const database = await connectDB();
    
    const newContact = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      subject: subject.trim(),
      message: message.trim(),
      category: category || 'general',
      read: false,
      replied: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user',
      timestamp: new Date()
    };
    
    const result = await database.collection('contact-requests').insertOne(newContact);
    
    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully',
      data: { ...newContact, _id: result.insertedId }
    });
  } catch (error) {
    console.error('❌ Create contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send contact message'
    });
  }
});

// Mark contact as read
app.put('/api/contacts/:id/read', async (req, res) => {
  try {
    const database = await connectDB();
    const result = await database.collection('contact-requests').updateOne(
      { _id: parseId(req.params.id) },
      { 
        $set: { 
          read: true, 
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contact message marked as read'
    });
  } catch (error) {
    console.error('❌ Mark contact as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark contact as read'
    });
  }
});

// Reply to contact message
app.post('/api/contacts/:id/reply', async (req, res) => {
  try {
    const { replyMessage } = req.body;
    
    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Reply message is required'
      });
    }
    
    const database = await connectDB();
    
    const updateResult = await database.collection('contact-requests').updateOne(
      { _id: parseId(req.params.id) },
      { 
        $set: { 
          replied: true, 
          replyMessage: replyMessage.trim(),
          replyDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    console.error('❌ Reply to contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send reply'
    });
  }
});

// Delete contact message
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const database = await connectDB();
    const result = await database.collection('contact-requests').deleteOne({ 
      _id: parseId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact message'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Contact API Server running on http://localhost:${PORT}`);
  console.log('📧 Contact endpoints available:');
  console.log('   GET /api/contacts - Get all contact messages');
  console.log('   POST /api/contacts - Create new contact message');
  console.log('   PUT /api/contacts/:id/read - Mark as read');
  console.log('   POST /api/contacts/:id/reply - Reply to message');
  console.log('   DELETE /api/contacts/:id - Delete message');
});
