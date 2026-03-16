const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
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
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// MongoDB configuration
const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

let db;
let client;

// Database connection
async function connectDB() {
  if (!db) {
    try {
      client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
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

// Helper function to parse ObjectId
function parseId(id) {
  try {
    return new ObjectId(id);
  } catch (error) {
    return id;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: DATABASE_NAME
  });
});

// === TICKET SYSTEM ENDPOINTS ===

// Get all tickets for admin dashboard
app.get('/api/tickets', async (req, res) => {
  try {
    const database = await connectDB();
    
    console.log('🎫 Admin fetching all tickets');
    
    const tickets = await database.collection('tickets')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: tickets,
      count: tickets.length,
      message: `Found ${tickets.length} total tickets`
    });
    
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch tickets',
      message: error.message 
    });
  }
});

// Get all tickets for a specific user
app.get('/api/tickets/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const database = await connectDB();
    
    console.log(`🎫 Fetching tickets for user: ${email}`);
    
    const tickets = await database.collection('tickets')
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: tickets,
      count: tickets.length,
      message: `Found ${tickets.length} tickets for ${email}`
    });
    
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch tickets',
      message: error.message 
    });
  }
});

// Create a new ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const database = await connectDB();
    const ticketData = req.body;
    
    console.log('🎫 Creating new ticket:', ticketData);
    
    // Generate ticket number
    const ticketCount = await database.collection('tickets').countDocuments();
    const ticketNumber = `ICSRT-${String(ticketCount + 1).padStart(6, '0')}`;
    
    const newTicket = {
      ticketNumber,
      subject: ticketData.subject || 'No Subject',
      message: ticketData.message || '',
      category: ticketData.category || 'general',
      priority: ticketData.priority || 'medium',
      status: 'open',
      userName: ticketData.name || ticketData.userName || 'Anonymous',
      userEmail: ticketData.email || ticketData.userEmail,
      userPhone: ticketData.phone || ticketData.userPhone,
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: [],
      tags: [],
      assignedTo: null
    };
    
    const result = await database.collection('tickets').insertOne(newTicket);
    
    if (result.insertedId) {
      console.log(`✅ Ticket created successfully: ${ticketNumber}`);
      res.json({
        success: true,
        data: { ...newTicket, _id: result.insertedId },
        ticketNumber,
        message: `Ticket ${ticketNumber} created successfully`
      });
    } else {
      throw new Error('Failed to create ticket');
    }
    
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create ticket',
      message: error.message 
    });
  }
});

// Get specific ticket by ID
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await connectDB();
    
    console.log(`🎫 Fetching ticket with ID: ${id}`);
    
    const ticket = await database.collection('tickets').findOne({ _id: parseId(id) });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: `No ticket found with ID: ${id}`
      });
    }
    
    res.json({
      success: true,
      data: ticket,
      message: `Ticket ${ticket.ticketNumber} found`
    });
    
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch ticket',
      message: error.message 
    });
  }
});

// Add response to ticket (admin replies)
app.post('/api/tickets/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, respondedBy } = req.body;
    const database = await connectDB();
    
    console.log(`🎫 Adding response to ticket: ${id}`);
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Response message is required'
      });
    }
    
    const response = {
      id: new ObjectId(),
      message: message.trim(),
      respondedBy: respondedBy || 'ICSRT Support',
      respondedAt: new Date(),
      type: 'admin_response'
    };
    
    const result = await database.collection('tickets').updateOne(
      { _id: parseId(id) },
      { 
        $push: { responses: response },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Response added to ticket: ${id}`);
      res.json({
        success: true,
        data: { response },
        message: 'Response added successfully'
      });
    } else {
      throw new Error('Failed to add response - ticket not found');
    }
    
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add response',
      message: error.message 
    });
  }
});

// Update ticket status
app.patch('/api/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updatedBy } = req.body;
    const database = await connectDB();
    
    console.log(`🎫 Updating ticket ${id} status to: ${status}`);
    
    const result = await database.collection('tickets').updateOne(
      { _id: parseId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          updatedBy: updatedBy || 'System'
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Ticket ${id} status updated to: ${status}`);
      res.json({
        success: true,
        message: `Ticket status updated to ${status}`
      });
    } else {
      throw new Error('Failed to update status - ticket not found');
    }
    
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update ticket status',
      message: error.message 
    });
  }
});

// Resolve ticket
app.patch('/api/tickets/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolvedBy, resolutionMessage } = req.body;
    const database = await connectDB();
    
    console.log(`🎫 Resolving ticket: ${id}`);
    
    const updateData = {
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: resolvedBy || 'ICSRT Admin',
      updatedAt: new Date()
    };
    
    if (resolutionMessage) {
      updateData.resolutionMessage = resolutionMessage;
    }
    
    const result = await database.collection('tickets').updateOne(
      { _id: parseId(id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Ticket ${id} resolved successfully`);
      res.json({
        success: true,
        message: 'Ticket resolved successfully'
      });
    } else {
      throw new Error('Failed to resolve ticket - ticket not found');
    }
    
  } catch (error) {
    console.error('Error resolving ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to resolve ticket',
      message: error.message 
    });
  }
});

// Close ticket
app.patch('/api/tickets/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const { closedBy, closeReason } = req.body;
    const database = await connectDB();
    
    console.log(`🎫 Closing ticket: ${id}`);
    
    const updateData = {
      status: 'closed',
      closedAt: new Date(),
      closedBy: closedBy || 'ICSRT Admin',
      updatedAt: new Date()
    };
    
    if (closeReason) {
      updateData.closeReason = closeReason;
    }
    
    const result = await database.collection('tickets').updateOne(
      { _id: parseId(id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Ticket ${id} closed successfully`);
      res.json({
        success: true,
        message: 'Ticket closed successfully'
      });
    } else {
      throw new Error('Failed to close ticket - ticket not found');
    }
    
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to close ticket',
      message: error.message 
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(port, () => {
      console.log(`🚀 ICSRT Minimal Tickets Server running on port ${port}`);
      console.log(`📋 Health Check: http://localhost:${port}/api/health`);
      console.log(`🎫 Tickets API: http://localhost:${port}/api/tickets`);
      console.log('\n✅ Available endpoints:');
      console.log('   - GET  /api/health (Server health check)');
      console.log('   - GET  /api/tickets (Get all tickets - admin)');
      console.log('   - GET  /api/tickets/user/:email (Get user tickets)');
      console.log('   - POST /api/tickets (Create new ticket)');
      console.log('   - GET  /api/tickets/:id (Get ticket details)');
      console.log('   - POST /api/tickets/:id/respond (Add admin response)');
      console.log('   - PATCH /api/tickets/:id/status (Update ticket status)');
      console.log('   - PATCH /api/tickets/:id/resolve (Resolve ticket)');
      console.log('   - PATCH /api/tickets/:id/close (Close ticket)');
      console.log('\n🎯 Dashboard should work now!');
    });
  } catch (error) {
    console.log('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
