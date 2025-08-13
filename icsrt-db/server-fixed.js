const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3001', // Dashboard
    'http://localhost:3002', // User page
    'http://localhost:3000'  // API itself
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || "icsrt-super-secure-jwt-secret-key-2025";

// Consistent MongoDB configuration
const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

let db;
let client;

// Enhanced database connection with retry logic
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
      
      // Create indexes for performance
      await createIndexes();
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }
  return db;
}

// Create database indexes for performance
async function createIndexes() {
  try {
    const database = await connectDB();
    
    // Admin indexes
    await database.collection('admins').createIndex({ email: 1 }, { unique: true, sparse: true });
    await database.collection('admins').createIndex({ username: 1 }, { unique: true });
    await database.collection('admins').createIndex({ status: 1 });
    
    // User indexes
    await database.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
    await database.collection('users').createIndex({ status: 1 });
    
    // General indexes for common collections
    const collections = ['papers', 'conferences', 'events', 'news', 'journals'];
    for (const collection of collections) {
      await database.collection(collection).createIndex({ createdAt: -1 });
      await database.collection(collection).createIndex({ status: 1 });
    }
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.warn('⚠️ Index creation warning:', error.message);
  }
}

// Utility function for parsing MongoDB ObjectIds
const parseId = (id) => {
  if (!id) return null;
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return new ObjectId(id);
  }
  return id;
};

// Input validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.details.map(d => d.message),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  };
};

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Enhanced RBAC Permission checking middleware
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    console.log(`🔒 Checking permission: ${requiredPermission} for user: ${req.user?.username || 'unknown'}`);
    
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'NO_AUTH'
        });
      }

      const database = await connectDB();
      
      // Find admin with proper error handling
      const admin = await database.collection('admins').findOne({
        $or: [
          { _id: parseId(req.user.id) },
          { username: req.user.username }
        ],
        status: 'active'
      });
      
      if (!admin) {
        console.log(`❌ Admin not found: ${req.user.username || req.user.id}`);
        return res.status(403).json({ 
          error: 'Admin account not found or inactive',
          code: 'ADMIN_NOT_FOUND'
        });
      }

      let permissions = [];

      // Super admin without custom role has all permissions
      if (admin.role === 'superadmin' && !admin.customRole) {
        console.log(`✅ Super admin ${admin.username} has all permissions`);
        permissions = ['*'];
        req.user.permissions = permissions;
        req.user.admin = admin;
        return next();
      }

      // Get permissions based on role or custom role
      if (admin.customRole) {
        const customRole = await database.collection('roles').findOne({
          $or: [
            { _id: parseId(admin.customRole) },
            { id: admin.customRole },
            { name: admin.customRole }
          ]
        });
        if (customRole) {
          permissions = customRole.permissions || [];
        }
      } else {
        // Default role permissions
        const rolePermissions = {
          'content_editor': [
            'dashboard.view', 'papers.view', 'papers.edit', 'news.view', 'news.edit',
            'journals.view', 'journals.edit', 'conferences.view', 'conferences.edit',
            'speakers.view', 'speakers.edit', 'events.view', 'events.edit',
            'about.view', 'about.edit', 'mission.view', 'mission.edit', 'vision.view', 'vision.edit',
            'faq.view', 'faq.edit', 'testimonials.view', 'testimonials.edit', 'gallery.view', 'gallery.edit'
          ],
          'user_manager': [
            'dashboard.view', 'users.view', 'users.edit', 'registrations.view', 'registrations.edit',
            'contacts.view', 'contacts.edit'
          ],
          'content_viewer': [
            'dashboard.view', 'papers.view', 'news.view', 'journals.view', 'conferences.view',
            'speakers.view', 'events.view', 'about.view', 'mission.view', 'vision.view',
            'users.view', 'registrations.view', 'contacts.view', 'faq.view', 'testimonials.view'
          ]
        };
        permissions = rolePermissions[admin.role] || ['dashboard.view'];
      }

      // Check if user has required permission
      if (!permissions.includes('*') && !permissions.includes(requiredPermission)) {
        console.log(`❌ Permission denied: ${admin.username} lacks ${requiredPermission}`);
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredPermission,
          available: permissions
        });
      }

      console.log(`✅ Permission granted: ${admin.username} has ${requiredPermission}`);
      req.user.permissions = permissions;
      req.user.admin = admin;
      next();

    } catch (error) {
      console.error('❌ Permission check error:', error);
      return res.status(500).json({ 
        error: 'Permission check failed',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// === AUTHENTICATION ENDPOINTS ===

// Unified login endpoint (works for both /api/auth/login and /api/admin/login)
const handleLogin = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    if (!password || (!email && !username)) {
      return res.status(400).json({ 
        error: 'Email/username and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const database = await connectDB();
    const loginField = (username || email)?.trim().toLowerCase();
    
    // Find admin account
    const admin = await database.collection('admins').findOne({
      $or: [
        { username: { $regex: new RegExp(`^${loginField}$`, 'i') } },
        { email: { $regex: new RegExp(`^${loginField}$`, 'i') } }
      ],
      status: 'active'
    });

    if (!admin) {
      console.log(`❌ Login failed: Admin not found for ${loginField}`);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    if (!admin.password) {
      console.error(`❌ Admin ${admin.username} has no password hash`);
      return res.status(500).json({ 
        error: 'Account configuration error',
        code: 'ACCOUNT_ERROR'
      });
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcryptjs.compare(password, admin.password);
    } catch (bcryptError) {
      console.error(`❌ Password verification error for ${admin.username}:`, bcryptError);
      return res.status(500).json({ 
        error: 'Authentication error',
        code: 'AUTH_ERROR'
      });
    }

    if (!isValidPassword) {
      console.log(`❌ Invalid password for admin: ${admin.username}`);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Get permissions for response
    let permissions = [];
    if (admin.role === 'superadmin' && !admin.customRole) {
      permissions = ['*'];
    } else if (admin.customRole) {
      const customRole = await database.collection('roles').findOne({
        $or: [
          { _id: parseId(admin.customRole) },
          { id: admin.customRole },
          { name: admin.customRole }
        ]
      });
      if (customRole) {
        permissions = customRole.permissions || [];
      }
    } else {
      const rolePermissions = {
        'content_editor': [
          'dashboard.view', 'papers.view', 'papers.edit', 'news.view', 'news.edit',
          'journals.view', 'journals.edit', 'conferences.view', 'conferences.edit',
          'speakers.view', 'speakers.edit', 'events.view', 'events.edit',
          'about.view', 'about.edit', 'mission.view', 'mission.edit', 'vision.view', 'vision.edit',
          'faq.view', 'faq.edit', 'testimonials.view', 'testimonials.edit'
        ],
        'user_manager': [
          'dashboard.view', 'users.view', 'users.edit', 'registrations.view', 'registrations.edit',
          'contacts.view', 'contacts.edit'
        ],
        'content_viewer': [
          'dashboard.view', 'papers.view', 'news.view', 'journals.view', 'conferences.view',
          'speakers.view', 'events.view', 'about.view', 'mission.view', 'vision.view',
          'users.view', 'registrations.view', 'contacts.view'
        ]
      };
      permissions = rolePermissions[admin.role] || ['dashboard.view'];
    }

    // Update last login
    await database.collection('admins').updateOne(
      { _id: admin._id },
      { $set: { lastLogin: new Date().toISOString() } }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role,
        customRole: admin.customRole || null,
        permissions: permissions,
        type: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Login successful: ${admin.username} (${admin.role})`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role,
        customRole: admin.customRole || null,
        permissions: permissions,
        isAdmin: true,
        type: 'admin'
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      code: 'LOGIN_ERROR',
      details: error.message
    });
  }
};

// Both login endpoints use the same handler
app.post('/api/auth/login', handleLogin);
app.post('/api/admin/login', handleLogin);

// Get current user info with permissions
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const database = await connectDB();
    const admin = await database.collection('admins').findOne({
      $or: [
        { _id: parseId(req.user.id) },
        { username: req.user.username }
      ],
      status: 'active'
    });

    if (!admin) {
      return res.status(404).json({ 
        error: 'Admin not found',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    // Get current permissions
    let permissions = [];
    if (admin.role === 'superadmin' && !admin.customRole) {
      permissions = ['*'];
    } else if (admin.customRole) {
      const customRole = await database.collection('roles').findOne({
        $or: [
          { _id: parseId(admin.customRole) },
          { id: admin.customRole },
          { name: admin.customRole }
        ]
      });
      if (customRole) {
        permissions = customRole.permissions || [];
      }
    } else {
      const rolePermissions = {
        'content_editor': [
          'dashboard.view', 'papers.view', 'papers.edit', 'news.view', 'news.edit',
          'journals.view', 'journals.edit', 'conferences.view', 'conferences.edit',
          'speakers.view', 'speakers.edit', 'events.view', 'events.edit',
          'about.view', 'about.edit', 'mission.view', 'mission.edit', 'vision.view', 'vision.edit',
          'faq.view', 'faq.edit', 'testimonials.view', 'testimonials.edit'
        ],
        'user_manager': [
          'dashboard.view', 'users.view', 'users.edit', 'registrations.view', 'registrations.edit',
          'contacts.view', 'contacts.edit'
        ],
        'content_viewer': [
          'dashboard.view', 'papers.view', 'news.view', 'journals.view', 'conferences.view',
          'speakers.view', 'events.view', 'about.view', 'mission.view', 'vision.view',
          'users.view', 'registrations.view', 'contacts.view'
        ]
      };
      permissions = rolePermissions[admin.role] || ['dashboard.view'];
    }

    res.json({
      user: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role,
        customRole: admin.customRole || null,
        isAdmin: true,
        type: 'admin'
      },
      permissions,
      role: admin.role,
      customRole: admin.customRole || null
    });

  } catch (error) {
    console.error('❌ Get user info error:', error);
    res.status(500).json({ 
      error: 'Failed to get user info',
      code: 'GET_USER_ERROR'
    });
  }
});

// Fixed permissions endpoint (the one that frontend expects)
app.get('/api/admin/my-permissions', authenticateToken, async (req, res) => {
  try {
    const database = await connectDB();
    const admin = await database.collection('admins').findOne({
      $or: [
        { _id: parseId(req.user.id) },
        { username: req.user.username }
      ],
      status: 'active'
    });

    if (!admin) {
      return res.status(404).json({ 
        error: 'Admin not found',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    // Get permissions
    let permissions = [];
    if (admin.role === 'superadmin' && !admin.customRole) {
      permissions = ['*'];
    } else if (admin.customRole) {
      const customRole = await database.collection('roles').findOne({
        $or: [
          { _id: parseId(admin.customRole) },
          { id: admin.customRole },
          { name: admin.customRole }
        ]
      });
      if (customRole) {
        permissions = customRole.permissions || [];
      }
    } else {
      const rolePermissions = {
        'content_editor': [
          'dashboard.view', 'papers.view', 'papers.edit', 'news.view', 'news.edit',
          'journals.view', 'journals.edit', 'conferences.view', 'conferences.edit',
          'speakers.view', 'speakers.edit', 'events.view', 'events.edit',
          'about.view', 'about.edit', 'mission.view', 'mission.edit', 'vision.view', 'vision.edit',
          'faq.view', 'faq.edit', 'testimonials.view', 'testimonials.edit'
        ],
        'user_manager': [
          'dashboard.view', 'users.view', 'users.edit', 'registrations.view', 'registrations.edit',
          'contacts.view', 'contacts.edit'
        ],
        'content_viewer': [
          'dashboard.view', 'papers.view', 'news.view', 'journals.view', 'conferences.view',
          'speakers.view', 'events.view', 'about.view', 'mission.view', 'vision.view',
          'users.view', 'registrations.view', 'contacts.view'
        ]
      };
      permissions = rolePermissions[admin.role] || ['dashboard.view'];
    }

    res.json({
      permissions,
      role: admin.role,
      customRole: admin.customRole || null
    });

  } catch (error) {
    console.error('❌ Get permissions error:', error);
    res.status(500).json({ 
      error: 'Failed to get permissions',
      code: 'GET_PERMISSIONS_ERROR'
    });
  }
});

// === DASHBOARD STATS ENDPOINT ===
app.get('/api/dashboard-stats', authenticateToken, checkPermission('dashboard.view'), async (req, res) => {
  try {
    const database = await connectDB();
    
    const stats = {
      totalUsers: await database.collection('users').countDocuments(),
      totalRegistrations: await database.collection('registrations').countDocuments(),
      totalPapers: await database.collection('papers').countDocuments(),
      totalEvents: await database.collection('events').countDocuments(),
      totalConferences: await database.collection('conferences').countDocuments(),
      totalSpeakers: await database.collection('speakers').countDocuments(),
      totalNews: await database.collection('news').countDocuments(),
      totalJournals: await database.collection('journals').countDocuments(),
      totalContacts: await database.collection('contacts').countDocuments(),
      totalServices: await database.collection('services').countDocuments(),
      totalTestimonials: await database.collection('testimonials').countDocuments(),
      totalFAQ: await database.collection('faq').countDocuments(),
      totalGallery: await database.collection('gallery').countDocuments(),
      
      // Pending counts
      pendingUsers: await database.collection('users').countDocuments({ status: 'pending' }),
      pendingRegistrations: await database.collection('registrations').countDocuments({ status: 'pending' }),
      
      // Recent activity (last 30 days)
      recentUsers: await database.collection('users').countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      }),
      recentRegistrations: await database.collection('registrations').countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      })
    };

    res.json(stats);
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      code: 'STATS_ERROR'
    });
  }
});

// === AUTO-GENERATED CRUD ROUTES ===
const collections = [
  'services', 'conferences', 'speakers', 'papers', 'journals', 'registrations',
  'contacts', 'users', 'about', 'mission', 'vision', 'events', 'news', 
  'testimonials', 'faq', 'gallery', 'home'
];

function generateRoutes(collectionName) {
  // GET all items
  app.get(`/api/${collectionName}`, authenticateToken, checkPermission(`${collectionName}.view`), async (req, res) => {
    try {
      const database = await connectDB();
      const { page = 1, limit = 50, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      let query = {};
      if (search) {
        query = {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ]
        };
      }
      
      const options = {
        skip: (parseInt(page) - 1) * parseInt(limit),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      };
      
      const [data, total] = await Promise.all([
        database.collection(collectionName).find(query, options).toArray(),
        database.collection(collectionName).countDocuments(query)
      ]);
      
      res.json({
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error(`❌ Get ${collectionName} error:`, error);
      res.status(500).json({ 
        error: `Failed to fetch ${collectionName}`,
        code: 'FETCH_ERROR'
      });
    }
  });

  // GET single item
  app.get(`/api/${collectionName}/:id`, authenticateToken, checkPermission(`${collectionName}.view`), async (req, res) => {
    try {
      const database = await connectDB();
      const item = await database.collection(collectionName).findOne({ 
        _id: parseId(req.params.id) 
      });
      
      if (!item) {
        return res.status(404).json({ 
          error: `${collectionName} not found`,
          code: 'NOT_FOUND'
        });
      }
      
      res.json(item);
    } catch (error) {
      console.error(`❌ Get ${collectionName} by ID error:`, error);
      res.status(500).json({ 
        error: `Failed to fetch ${collectionName}`,
        code: 'FETCH_ERROR'
      });
    }
  });

  // POST new item
  app.post(`/api/${collectionName}`, authenticateToken, checkPermission(`${collectionName}.edit`), async (req, res) => {
    try {
      const database = await connectDB();
      const newItem = {
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.username,
        updatedAt: new Date().toISOString()
      };
      
      const result = await database.collection(collectionName).insertOne(newItem);
      
      res.status(201).json({ 
        success: true,
        id: result.insertedId,
        message: `${collectionName} created successfully`,
        data: { ...newItem, _id: result.insertedId }
      });
    } catch (error) {
      console.error(`❌ Create ${collectionName} error:`, error);
      res.status(500).json({ 
        error: `Failed to create ${collectionName}`,
        code: 'CREATE_ERROR'
      });
    }
  });

  // PUT update item
  app.put(`/api/${collectionName}/:id`, authenticateToken, checkPermission(`${collectionName}.edit`), async (req, res) => {
    try {
      const database = await connectDB();
      const updateData = {
        ...req.body,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.username
      };
      
      const result = await database.collection(collectionName).updateOne(
        { _id: parseId(req.params.id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ 
          error: `${collectionName} not found`,
          code: 'NOT_FOUND'
        });
      }
      
      res.json({ 
        success: true,
        message: `${collectionName} updated successfully`
      });
    } catch (error) {
      console.error(`❌ Update ${collectionName} error:`, error);
      res.status(500).json({ 
        error: `Failed to update ${collectionName}`,
        code: 'UPDATE_ERROR'
      });
    }
  });

  // DELETE item
  app.delete(`/api/${collectionName}/:id`, authenticateToken, checkPermission(`${collectionName}.edit`), async (req, res) => {
    try {
      const database = await connectDB();
      const result = await database.collection(collectionName).deleteOne({ 
        _id: parseId(req.params.id) 
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          error: `${collectionName} not found`,
          code: 'NOT_FOUND'
        });
      }
      
      res.json({ 
        success: true,
        message: `${collectionName} deleted successfully`
      });
    } catch (error) {
      console.error(`❌ Delete ${collectionName} error:`, error);
      res.status(500).json({ 
        error: `Failed to delete ${collectionName}`,
        code: 'DELETE_ERROR'
      });
    }
  });
}

// Generate routes for all collections
collections.forEach(generateRoutes);

// === ADMIN MANAGEMENT ROUTES ===
app.use('/api/admin', require('./adminRoutes'));

// === UTILITY ENDPOINTS ===

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: DATABASE_NAME,
    uptime: process.uptime()
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const database = await connectDB();
    const adminCount = await database.collection('admins').countDocuments();
    res.json({
      status: 'connected',
      database: DATABASE_NAME,
      adminCount
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// === ERROR HANDLING MIDDLEWARE ===

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    message: error.message
  });
});

// === SERVER STARTUP ===

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  if (client) {
    await client.close();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  if (client) {
    await client.close();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 ICSRT Backend Server running on port ${port}`);
      console.log(`📊 Dashboard: http://localhost:3001`);
      console.log(`🌐 User Page: http://localhost:3002`);
      console.log(`📋 API Health: http://localhost:${port}/api/health`);
      console.log('📝 Available endpoints:');
      console.log('   - POST /api/auth/login (Admin login)');
      console.log('   - GET  /api/auth/me (User info & permissions)');
      console.log('   - GET  /api/dashboard-stats (Dashboard statistics)');
      console.log('   - Auto-generated CRUD for:', collections.join(', '));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
