const express = require("express");
const DATABASE_NAME = process.env.DATABASE_NAME || "icsrt_main";
const path = require('path');
const fs = require('fs');
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const whatsappService = require('./whatsapp-service');
const { addEnhancedServiceOrdersAPI } = require('./enhanced-service-orders-api-simple');
const { addServiceOrderPurchaseAPI } = require('./service-order-purchase-api');
const { addPurchaseLinkAPI } = require('./purchase-link-api');
const { addAdminCommunicationAPI } = require('./admin-communication-api');
const { addCouponAPI } = require('./coupon-api');
require('dotenv').config(); // Load environment variables
console.log("Loaded DATABASE_NAME:", process.env.DATABASE_NAME);
const app = express();
const port = process.env.PORT || 3000;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'icsrt-dashboard-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

// Helper function to get production domains
const getProductionDomains = () => {
  const domains = [];
  
  // Add production domains if they exist
  if (process.env.NODE_ENV === 'production') {
    // User page: icsrt.cloud
    domains.push('https://icsrt.cloud');
    // Admin dashboard: admin.icsrt.cloud
    domains.push('https://admin.icsrt.cloud');
  }
  
  return domains;
};

// Helper function to get frontend URL (checks environment and defaults appropriately)
const getFrontendUrl = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  // Production domain for userpage
  if (process.env.NODE_ENV === 'production') {
    return 'https://icsrt.cloud';
  }
  
  // Development localhost
  return 'http://localhost:3002';
};

// Helper function to get API URL (checks environment and defaults appropriately)
const getApiUrl = () => {
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  
  // Production: Use the same domain as frontend (reverse proxy setup)
  // Backend will be accessible at domain.com/api/* via nginx/apache proxy
  if (process.env.NODE_ENV === 'production') {
    return getFrontendUrl(); // Same as frontend URL
  }
  
  // Development localhost
  return 'http://localhost:3000';
};

// Allowed origins: read from env (comma-separated), fallback to common localhost dev ports
const envOrigins = (process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const productionDomains = getProductionDomains();
const allowedOrigins = envOrigins.length ? envOrigins : [
  ...productionDomains,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:5173'
];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Development: Allow all localhost and local IPs
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || 
        origin.match(/https?:\/\/(192\.168\.|10\.)\d+\.\d+:\d+/)) {
      console.log('✅ Dev origin allowed:', origin);
      return callback(null, true);
    }
    
    // Production: Extract domain and allow main domain + subdomains
    try {
      const url = new URL(origin);
      const hostname = url.hostname;
      const domainParts = hostname.split('.');
      
      // Get main domain (last 2 parts, e.g., "icsrt.cloud" from "admin.icsrt.cloud")
      if (domainParts.length >= 2) {
        const mainDomain = domainParts.slice(-2).join('.');
        
        // Allow any subdomain of the main domain (e.g., *.icsrt.cloud)
        // This includes: icsrt.cloud, www.icsrt.cloud, admin.icsrt.cloud, api.icsrt.cloud, etc.
        if (hostname === mainDomain || hostname.endsWith('.' + mainDomain)) {
          console.log('✅ Production origin allowed:', origin);
          return callback(null, true);
        }
      }
    } catch (e) {
      console.error('Error parsing origin:', e);
    }
    
    // Block all other origins
    console.warn(`⚠️ CORS blocked request from: ${origin}`);
    callback(new Error('CORS not allowed from origin: ' + origin));
  },
  credentials: true, // Allow cookies/tokens to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Configure Helmet with proper CSP for API and cross-origin requests
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...productionDomains],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(mongoSanitize());
// Global rate limit (adjust as needed)
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false });
app.use(globalLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`📁 Created uploads directory at ${UPLOADS_DIR}`);
  } catch (err) {
    console.warn('⚠️ Failed to create uploads directory:', err.message);
  }
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Download endpoint with proper headers to force download
app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(UPLOADS_DIR, filename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.sendFile(filepath);
  } catch (error) {
    console.error('❌ Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// helmet above already sets standard security headers

// Request logging middleware (dev only unless LOG_REQUESTS=1)
app.use((req, res, next) => {
  if (process.env.LOG_REQUESTS === '1' || process.env.NODE_ENV !== 'production') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  }
  next();
});
// Basic admin guard: require ADMIN_API_TOKEN for write ops in production

// ===== AUTH MIDDLEWARES =====

// Admin auth middleware
const requireAdmin = (req, res, next) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : hdr;

  // Skip admin auth for user site public routes
const origin = req.headers.origin || '';
const isUserSite = origin.includes('icsrt.cloud') && !origin.includes('admin.');

if (isUserSite && req.path.startsWith('/api/service-orders')) {
  return next(); // allow users to submit service orders without token
}

// Otherwise, require admin token for admin paths
if (!token) {
  return res.status(401).json({ error: 'Unauthorized', code: 'ADMIN_AUTH_REQUIRED' });
}


  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Forbidden', code: 'ADMIN_AUTH_REQUIRED' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'ADMIN_AUTH_REQUIRED' });
  }
};

// User auth middleware (for logged-in users)
const requireUser = (req, res, next) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : hdr;

  if (!token) {
    return res.status(401).json({ error: 'No token provided', code: 'USER_AUTH_REQUIRED' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.role !== 'user') {
      return res.status(403).json({ error: 'Forbidden', code: 'USER_AUTH_REQUIRED' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'USER_AUTH_REQUIRED' });
  }
};

// ===== ROUTE ATTACHMENT =====

// ===== ROUTE ATTACHMENT =====

// ✅ Admin protection for write operations

  // Allow free access for user and public endpoints
  
// Tighter limits for auth endpoints
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth/', authLimiter);

// Consistent MongoDB configuration (allow override via ENV)
const { getDB } = require('./mongodb-config');

// Use getDB() instead of connectDB() throughout the code
async function connectDB() {
  const db = await getDB();
  try {
    // Create indexes for performance if needed
    await createIndexes(db);
  } catch (error) {
    console.warn('⚠️ Index creation warning:', error.message);
  }
  return db;
}

// Create database indexes for performance
async function createIndexes(database) {
  if (!database) return;
  
  // User indexes
  await database.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
  await database.collection('users').createIndex({ status: 1 });
  
  // General indexes for common collections
  const collections = ['papers', 'conferences', 'events', 'news', 'journals', 'tickets'];
  for (const collection of collections) {
    await database.collection(collection).createIndex({ createdAt: -1 });
    await database.collection(collection).createIndex({ status: 1 });
  }
  
  // Ticket-specific indexes
  await database.collection('tickets').createIndex({ userEmail: 1 });
  await database.collection('tickets').createIndex({ ticketNumber: 1 });
  
  console.log('✅ Database indexes created');
}

// Utility function for parsing MongoDB ObjectIds
const parseId = (id) => {
  if (!id) return null;
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return new ObjectId(id);
  }
  return id;
};

// Password utilities
const isHashedPassword = (pwd) => typeof pwd === 'string' && pwd.startsWith('$2');
const hashPassword = async (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);
const verifyPassword = async (plain, hashedOrPlain) => {
  if (!hashedOrPlain || typeof hashedOrPlain !== 'string') return false;
  if (isHashedPassword(hashedOrPlain)) return bcrypt.compare(plain, hashedOrPlain);
  // Legacy plaintext support
  return plain === hashedOrPlain;
};

// Name/Phone helpers (normalize new signup structure)
const deriveFullName = (fullName, firstName, lastName) => {
  const combined = [firstName, lastName].filter(Boolean).join(' ').trim();
  return (fullName && fullName.trim()) || combined || '';
};

const normalizePhoneInput = (phone) => {
  if (!phone) return null;
  try {
    if (typeof phone === 'string') {
      const cleaned = String(phone).replace(/[\s-]/g, '');
      return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    }
    if (typeof phone === 'object') {
      const code = String(phone.code || '').replace(/\D/g, '');
      const num = String(phone.number || '').replace(/\D/g, '');
      const full = phone.full || (code ? `+${code}${num}` : num);
      const cleaned = String(full).replace(/[\s-]/g, '');
      return cleaned ? (cleaned.startsWith('+') ? cleaned : `+${cleaned}`) : null;
    }
  } catch (e) {
    // fallthrough
  }
  return null;
};

// Email configuration for verification
const createEmailTransporter = () => {
  // Check if email credentials are properly configured
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass || emailUser === 'your-email@gmail.com' || emailPass === 'your-app-password-here') {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.error('❌ CRITICAL: Email credentials not configured in PRODUCTION!');
      console.error('📧 Email features will NOT work!');
      console.error('⚠️  Set EMAIL_USER and EMAIL_PASS environment variables on your server');
      console.error('📖 See EMAIL-SETUP-PRODUCTION.md for instructions');
    } else {
      console.log('⚠️  Email credentials not configured - using development mode');
      console.log('📝 Update .env file with real Gmail credentials for testing');
    }
    return null;
  }
  
  console.log(`📧 Email configured with: ${emailUser}`);
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    },
    pool: true, // Use pooled connections for better performance
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000, // Rate limit: 1 second
    rateLimit: 5 // Max 5 emails per rateDelta
  });
};

// Generate verification code
const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-character hex code
};

// Generate verification token (for email links)
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, fullName, verificationCode, verificationToken) => {
  try {
    const transporter = createEmailTransporter();
    const FRONTEND_BASE = getFrontendUrl();
    
    // If transporter is null, handle based on environment
    if (!transporter) {
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        console.error('\n❌ CRITICAL ERROR: Cannot send verification email in PRODUCTION');
        console.error('═══════════════════════════════════════════════════════════');
        console.error(`📧 Failed to send to: ${email}`);
        console.error(`👤 User: ${fullName}`);
        console.error(`⚠️  EMAIL_USER and EMAIL_PASS not configured on server`);
        console.error('📖 Configure email credentials in production environment');
        console.error('═══════════════════════════════════════════════════════════\n');
        throw new Error('Email service not configured in production');
      } else {
        console.log('\n🚨 EMAIL NOT CONFIGURED - Development Mode 🚨');
        console.log('═══════════════════════════════════════════════');
        console.log(`📧 Email: ${email}`);
        console.log(`👤 Name: ${fullName}`);
        console.log(`🔐 Verification Code: ${verificationCode}`);
        console.log(`🔗 Verification Token: ${verificationToken}`);
        console.log(`🌐 Verification Link: ${FRONTEND_BASE}/verify-email?token=${verificationToken}`);
        console.log('═══════════════════════════════════════════════');
        console.log('ℹ️  Use the verification code above to verify the account');
        console.log('ℹ️  Or click the verification link above\n');
        return false; // Email not sent but info logged
      }
    }
    
    // Verify transporter before sending
    await transporter.verify();
    console.log(`✅ Email transporter verified for ${email}`);
    
    const mailOptions = {
      from: `"ICSRT System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'ICSRT - Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">ICSRT</h1>
            <p style="color: #666; margin: 5px 0;">International Conference on Science, Research & Technology</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 10px; padding: 30px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Welcome ${fullName}!</h2>
            <p>Thank you for signing up with ICSRT. To complete your registration, please verify your email address using one of the methods below:</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Method 1: Verification Code</h3>
              <p>Enter this code on the verification page:</p>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; text-align: center; background: #eff6ff; padding: 20px; border-radius: 8px; font-family: monospace;">
                ${verificationCode}
              </div>
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Method 2: Direct Link</h3>
              <p>Or click this link to verify automatically:</p>
              <a href="${FRONTEND_BASE}/verify-email?token=${verificationToken}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
            <p><strong>Important:</strong></p>
            <ul>
              <li>This verification code will expire in 24 hours</li>
              <li>If you didn't create an account with ICSRT, you can safely ignore this email</li>
              <li>For support, contact us at support@icsrt.com</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>© 2025 ICSRT. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to ${email}`);
    console.log(`📨 Message ID: ${result.messageId}`);
    return true;
    
  } catch (error) {
    const isProduction = process.env.NODE_ENV === 'production';
    console.error(`❌ Failed to send verification email to ${email}:`, error.message);
    
    // Log detailed error for debugging
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed - EMAIL_USER or EMAIL_PASS incorrect');
      console.error('   Check Gmail app password is valid and 2FA is enabled');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Network error - cannot reach Gmail servers');
      console.error('   Check server internet connection and firewall settings');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️  Connection timeout - Gmail servers not responding');
      console.error('   Check server internet connection and try again');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection refused - SMTP port blocked');
      console.error('   Check firewall allows outbound connections on port 587/465');
    }
    
    if (isProduction) {
      console.error('⚠️  PRODUCTION EMAIL FAILURE - User registration may be affected');
      console.error(`   Email: ${email}, Time: ${new Date().toISOString()}`);
    }
    
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, fullName, resetToken) => {
  try {
    const transporter = createEmailTransporter();
    const FRONTEND_BASE = getFrontendUrl();
    const resetLink = `${FRONTEND_BASE}/reset-password?token=${resetToken}`;

    // Handle missing transporter based on environment
    if (!transporter) {
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        console.error('\n❌ CRITICAL: Cannot send password reset email in PRODUCTION');
        console.error('═══════════════════════════════════════════════════════════');
        console.error(`📧 Failed to send to: ${email}`);
        console.error(`⚠️  EMAIL_USER and EMAIL_PASS not configured on server`);
        console.error('═══════════════════════════════════════════════════════════\n');
        throw new Error('Email service not configured in production');
      } else {
        console.log('\n🚨 EMAIL NOT CONFIGURED - Development Mode (Password Reset) 🚨');
        console.log('═════════════════════════════════════════════════════════════');
        console.log(`📧 Email: ${email}`);
        console.log(`👤 Name: ${fullName}`);
        console.log(`🔗 Reset Link: ${resetLink}`);
        console.log('═════════════════════════════════════════════════════════════\n');
        return false;
      }
    }

    await transporter.verify();
    console.log(`✅ Email transporter verified for ${email}`);

    const mailOptions = {
      from: `"ICSRT System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'ICSRT - Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">ICSRT</h1>
            <p style="color: #666; margin: 5px 0;">International Conference on Science, Research & Technology</p>
          </div>
          <div style="background: #f8fafc; border-radius: 10px; padding: 30px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Password Reset Request</h2>
            <p>Hello ${fullName || ''},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If you didn't request this, you can ignore this email.</p>
            <p style="font-size: 12px; color: #6b7280;">This link will expire in 1 hour.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to ${email}`);
    console.log(`📨 Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${email}:`, error.message);
    return false;
  }
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

// === ENHANCED SERVICE ORDERS API ===
// Load enhanced service orders API first to ensure proper endpoint overriding
try {
  console.log("🔧 Loading enhanced service orders API...");
  addEnhancedServiceOrdersAPI(app, connectDB);
  console.log("✅ Enhanced service orders API loaded successfully");
} catch (error) {
  console.error("❌ Error loading enhanced service orders API:", error);
}

// === SERVICE ORDER PURCHASE API ===
// Load purchase API for Paymob integration
try {
  console.log("🔧 Loading service order purchase API...");
  addServiceOrderPurchaseAPI(app, connectDB);
  console.log("✅ Service order purchase API loaded successfully");
} catch (error) {
  console.error("❌ Error loading service order purchase API:", error);
}

// === PURCHASE LINK API ===
// Load purchase link API for admin-generated payment links
try {
  console.log("🔧 Loading purchase link API...");
  addPurchaseLinkAPI(app, connectDB);
  console.log("✅ Purchase link API loaded successfully");
} catch (error) {
  console.error("❌ Error loading purchase link API:", error);
}

// === ADMIN COMMUNICATION API ===
try {
  console.log("🔧 Loading admin communication API...");
  addAdminCommunicationAPI(app, connectDB);
  console.log("✅ Admin communication API loaded successfully");
} catch (error) {
  console.error("❌ Error loading admin communication API:", error);
}

// === COUPON API ===
try {
  console.log("🔧 Loading coupon API...");
  addCouponAPI(app, connectDB);
  console.log("✅ Coupon API loaded successfully");
} catch (error) {
  console.error("❌ Error loading coupon API:", error);
}

// === DASHBOARD STATS ENDPOINT ===
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const database = await connectDB();

    // Dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Helper: count documents within date range for given date fields
    const countInRange = async (collection, dateFields, start, end) => {
      const fields = Array.isArray(dateFields) ? dateFields : [dateFields];
      const pipeline = [
        {
          $addFields: {
            __ts: {
              $convert: {
                input: { $ifNull: ['$' + fields[0], fields[1] ? ('$' + fields[1]) : null] },
                to: 'date',
                onError: new Date(0),
                onNull: new Date(0)
              }
            }
          }
        },
        { $match: { __ts: { $gte: start, $lt: end } } },
        { $count: 'c' }
      ];
      const out = await database.collection(collection).aggregate(pipeline).toArray();
      return out[0]?.c || 0;
    };

    // Helper: revenue in range (EGP) from payments
    const revenueForRange = async (start, end) => {
      const agg = await database.collection('payments').aggregate([
        {
          $addFields: {
            __ts: {
              $convert: {
                input: { $ifNull: ['$completedAt', { $ifNull: ['$updatedAt', '$createdAt'] }] },
                to: 'date',
                onError: new Date(0),
                onNull: new Date(0)
              }
            }
          }
        },
        {
          $match: {
            paymentStatus: { $in: ['completed', 'paid'] },
            currency: { $in: ['EGP', 'EG'] },
            __ts: { $gte: start, $lt: end }
          }
        },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$amount', 0] } }, count: { $sum: 1 } } }
      ]).toArray();
      return { total: agg[0]?.total || 0, count: agg[0]?.count || 0 };
    };

    // Revenue and trends
    const current = await revenueForRange(startOfMonth, startOfNextMonth);
    const previous = await revenueForRange(startOfPrevMonth, startOfMonth);
    const monthlyRevenue = Math.round(current.total);
    const monthlyRevenuePrev = Math.round(previous.total);
    const monthlyRevenueChangePercent = monthlyRevenuePrev > 0
      ? ((monthlyRevenue - monthlyRevenuePrev) / monthlyRevenuePrev) * 100
      : (monthlyRevenue > 0 ? 100 : 0);

    // Trend percents for counts
    const usersCur = await countInRange('users', 'createdAt', startOfMonth, startOfNextMonth);
    const usersPrev = await countInRange('users', 'createdAt', startOfPrevMonth, startOfMonth);
    const usersChangePercent = usersPrev > 0 ? ((usersCur - usersPrev) / usersPrev) * 100 : (usersCur > 0 ? 100 : 0);

    const ticketsCur = await countInRange('tickets', 'createdAt', startOfMonth, startOfNextMonth);
    const ticketsPrev = await countInRange('tickets', 'createdAt', startOfPrevMonth, startOfMonth);
    const ticketsChangePercent = ticketsPrev > 0 ? ((ticketsCur - ticketsPrev) / ticketsPrev) * 100 : (ticketsCur > 0 ? 100 : 0);

    const ordersCur = await countInRange('service-orders', ['submittedAt', 'createdAt'], startOfMonth, startOfNextMonth);
    const ordersPrev = await countInRange('service-orders', ['submittedAt', 'createdAt'], startOfPrevMonth, startOfMonth);
  const serviceOrdersChangePercent = ordersPrev > 0 ? ((ordersCur - ordersPrev) / ordersPrev) * 100 : (ordersCur > 0 ? 100 : 0);

  // Collaborations counts
  const totalCollaborations = await database.collection('collaborations').countDocuments();
  const collaborationsSubmitted = await database.collection('collaborations').countDocuments({ status: 'submitted' });
  const collaborationsReview = await database.collection('collaborations').countDocuments({ status: 'review' });
  const collaborationsApproved = await database.collection('collaborations').countDocuments({ status: 'approved' });
  const collaborationsRejected = await database.collection('collaborations').countDocuments({ status: 'rejected' });

    const stats = {
      // Main Stats
      totalUsers: await database.collection('users').countDocuments(),
      totalTickets: await database.collection('tickets').countDocuments(),
  totalServiceOrders: await database.collection('service-orders').countDocuments(),
  // Collaborations
  totalCollaborations,
  collaborationsSubmitted,
  collaborationsReview,
  collaborationsApproved,
  collaborationsRejected,
      monthlyRevenue,
      monthlyRevenueCurrency: 'EGP',
      monthlyRevenueChangePercent: Number(monthlyRevenueChangePercent.toFixed(2)),
      totalPaymentsThisMonth: current.count,
      usersChangePercent: Number(usersChangePercent.toFixed(2)),
      ticketsChangePercent: Number(ticketsChangePercent.toFixed(2)),
      serviceOrdersChangePercent: Number(serviceOrdersChangePercent.toFixed(2)),

      // Content Stats
      activeProjects: await database.collection('service-orders').countDocuments({ status: { $in: ['in-progress', 'review'] } }),
      pendingReviews: await database.collection('service-orders').countDocuments({ status: 'review' }),
      newMessages: await database.collection('messages').countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() } }),
      totalNews: await database.collection('news').countDocuments(),
      totalServices: await database.collection('services').countDocuments(),

      // Additional Stats
      totalFAQ: await database.collection('faq').countDocuments(),
      totalTestimonials: await database.collection('testimonials').countDocuments(),
      totalGallery: await database.collection('gallery').countDocuments(),
      totalContacts: await database.collection('contacts').countDocuments(),

      // Pending Actions
      pendingTickets: await database.collection('tickets').countDocuments({ status: { $in: ['open', 'pending'] } }),
      pendingOrders: await database.collection('service-orders').countDocuments({ status: { $in: ['pending', 'quoted'] } }),

      // Recent activity (last 30 days)
      recentUsers: await database.collection('users').countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() } }),
      recentTickets: await database.collection('tickets').countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() } }),
      recentServiceOrders: await database.collection('service-orders').countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() } })
    };

    res.json(stats);
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', code: 'STATS_ERROR' });
  }
});

// === USER-SPECIFIC ENDPOINTS ===

// User statistics endpoint
app.get('/api/user-stats', async (req, res) => {
  try {
    const database = await connectDB();
    
    // For now, return general stats since we removed auth
    // In a real app, you'd filter by user ID
    const stats = {
      totalTickets: await database.collection('tickets').countDocuments(),
      totalServiceOrders: await database.collection('service-orders').countDocuments(),
      activeProjects: await database.collection('service-orders').countDocuments({ 
        status: { $in: ['in-progress', 'review'] } 
      }),
      newMessages: await database.collection('messages').countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
      }),
      recentActivity: {
        tickets: await database.collection('tickets').countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
        }),
        serviceOrders: await database.collection('service-orders').countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
        })
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('❌ User stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user stats',
      code: 'USER_STATS_ERROR'
    });
  }
});

// Enhanced login endpoint with email verification check
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    const database = await connectDB();
    const user = await database.collection('users').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email address before logging in',
        code: 'EMAIL_NOT_VERIFIED',
        needsVerification: true,
        email: user.email
      });
    }

    // Verify password (supports legacy plaintext then upgrades)
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // If legacy plaintext, upgrade to hashed silently
    if (!isHashedPassword(user.password)) {
      try {
        const hashed = await hashPassword(password);
        await (await connectDB()).collection('users').updateOne(
          { _id: user._id },
          { $set: { password: hashed, updatedAt: new Date().toISOString() } }
        );
        console.log(`🔐 Upgraded password hash for user ${user.email}`);
      } catch (e) {
        console.warn('Password upgrade failed:', e.message);
      }
    }

    // Update last login time
    await database.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } 
      }
    );

    // Return user data for successful login
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
  institution: user.institution,
  country: user.country,
  userType: user.userType || 'user',
        role: user.role || 'user',
        isVerified: user.isVerified,
        status: user.status
      },
      token: 'verified-user-token' // Enhanced token for verified users
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// Admin login endpoint - securely verify admin credentials server-side
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required', code: 'MISSING_CREDENTIALS' });
    }

    const database = await connectDB();

    // Try to find admin by email (case-insensitive), username or name
    const q = {
      $or: [
        { email: String(username).toLowerCase() },
        { username: username },
        { name: username }
      ]
    };

    const admin = await database.collection('admins').findOne(q);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid username or password', code: 'INVALID_CREDENTIALS' });
    }

    // Use verifyPassword utility which supports hashed and legacy plaintext
    const valid = await verifyPassword(password, admin.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid username or password', code: 'INVALID_CREDENTIALS' });
    }

    // If admin password was stored in plaintext, attempt to upgrade to a hash
    if (!isHashedPassword(admin.password)) {
      try {
        const hashed = await hashPassword(password);
        await database.collection('admins').updateOne({ _id: admin._id }, { $set: { password: hashed, updatedAt: new Date().toISOString() } });
        console.log(`🔐 Upgraded admin password to hashed for ${admin.email || admin.username}`);
      } catch (e) {
        console.warn('⚠️ Failed to upgrade admin password hash:', e.message);
      }
    }

    // Create JWT token for admin session
    const tokenPayload = { id: admin._id, email: admin.email || admin.username, role: admin.role || 'admin' };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Sanitize admin data before returning
    const { password: _p, resetPasswordToken, resetPasswordExpires, ...safeAdmin } = admin;

    res.json({ success: true, message: 'Admin login successful', admin: safeAdmin, token });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ success: false, error: 'Admin login failed', code: 'ADMIN_LOGIN_ERROR' });
  }
});

// === CUSTOM USER AUTHENTICATION ENDPOINTS ===

// User Signup Endpoint with Email Verification
app.post('/api/auth/signup', async (req, res) => {
  try {
    const database = await connectDB();
    const { 
      fullName,
      firstName,
      lastName,
      email, 
      password, 
  phone, 
  // Persist these too (were previously ignored)
  institution,
  country,
  userType,
  // Ignore other registration-specific fields
      ...otherFields 
    } = req.body;

    // Validate required fields
    const computedFullName = deriveFullName(fullName, firstName, lastName);
    if (!computedFullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name (first and last), email, and password are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check if user already exists
    const existingUser = await database.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Generate verification codes
    const verificationCode = generateVerificationCode();
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Normalize userType to combined categories (reuse logic from /register)
    const normalizeUserType = (ut) => {
      if (!ut) return 'user';
      const s = String(ut).toLowerCase().trim();
      if (s === 'student_academic' || s === 'researcher_professional') return s;
      if (s.includes('student') || s.includes('academic')) return 'student_academic';
      if (s.includes('researcher') || s.includes('professional')) return 'researcher_professional';
      return s;
    };

    // Create user object (now includes institution, country, userType)
    const newUser = {
      fullName: computedFullName,
      firstName: firstName || null,
      lastName: lastName || null,
      email: email.toLowerCase(),
      password: await hashPassword(password),
      phone: normalizePhoneInput(phone),
      institution: institution || null,
      country: country || null,
      userType: normalizeUserType(userType),
      isVerified: false,
      verificationCode,
      verificationToken,
      verificationExpires,
      status: 'pending', // pending until verified
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'signup'
    };

    // Insert user into database
    const result = await database.collection('users').insertOne(newUser);

    // Send verification email
  const emailSent = await sendVerificationEmail(email, newUser.fullName, verificationCode, verificationToken);

    if (!emailSent) {
      console.warn('⚠️ Failed to send verification email, but user was created');
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification instructions.',
      userId: result.insertedId,
      emailSent,
      data: {
        _id: result.insertedId,
  fullName: newUser.fullName,
        email,
        isVerified: false,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user account',
      code: 'SIGNUP_ERROR'
    });
  }
});

// Email Verification Endpoint (by code)
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const database = await connectDB();
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'Email and verification code are required',
        code: 'MISSING_VERIFICATION_DATA'
      });
    }

    // Find user with matching email and verification code
    const user = await database.collection('users').findOne({
      email: email.toLowerCase(),
      verificationCode: verificationCode.toUpperCase(),
      verificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code',
        code: 'INVALID_VERIFICATION_CODE'
      });
    }

    // Update user as verified
    await database.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          status: 'active',
          verifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        $unset: {
          verificationCode: '',
          verificationToken: '',
          verificationExpires: ''
        }
      }
    );

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        isVerified: true,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email',
      code: 'VERIFICATION_ERROR'
    });
  }
});

// Email Verification Endpoint (by token - for email links)
app.get('/api/auth/verify-email/:token', async (req, res) => {
  try {
    const database = await connectDB();
    const { token } = req.params;

    // Find user with matching verification token
    const user = await database.collection('users').findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification link',
        code: 'INVALID_VERIFICATION_TOKEN'
      });
    }

    // Update user as verified
    await database.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          status: 'active',
          verifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        $unset: {
          verificationCode: '',
          verificationToken: '',
          verificationExpires: ''
        }
      }
    );

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        isVerified: true,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email',
      code: 'VERIFICATION_ERROR'
    });
  }
});

// Resend Verification Email Endpoint
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const database = await connectDB();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    // Find unverified user
    const user = await database.collection('users').findOne({
      email: email.toLowerCase(),
      isVerified: false
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found or already verified',
        code: 'USER_NOT_FOUND_OR_VERIFIED'
      });
    }

    // Generate new verification codes
    const verificationCode = generateVerificationCode();
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new verification data
    await database.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          verificationCode,
          verificationToken,
          verificationExpires,
          updatedAt: new Date().toISOString()
        }
      }
    );

    // Send new verification email
    const emailSent = await sendVerificationEmail(user.email, user.fullName, verificationCode, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      emailSent
    });

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email',
      code: 'RESEND_ERROR'
    });
  }
});

// Alternative register endpoint (for user page compatibility)
app.post('/api/auth/register', async (req, res) => {
  try {
    const database = await connectDB();
    const { 
      fullName,
      firstName,
      lastName,
      email, 
      password, 
      phone, 
      institution,
      country,
  userType,
      // Ignore other fields
      ...otherFields 
    } = req.body;

    // Validate required fields
    const computedFullName = deriveFullName(fullName, firstName, lastName);
    if (!computedFullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name (first and last), email, and password are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
        code: 'INVALID_EMAIL'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    // Check if user already exists
    const existingUser = await database.collection('users').findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'A user with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Generate verification codes
    const verificationCode = generateVerificationCode();
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Normalize userType to combined categories
    const normalizeUserType = (ut) => {
      if (!ut) return 'user';
      const s = String(ut).toLowerCase().trim();
      if (s === 'student_academic' || s === 'researcher_professional') return s;
      if (s.includes('student') || s.includes('academic')) return 'student_academic';
      if (s.includes('researcher') || s.includes('professional')) return 'researcher_professional';
      return s; // fallback to whatever was provided
    };

    // Create user object
    const userData = {
      fullName: computedFullName.trim(),
      firstName: firstName || null,
      lastName: lastName || null,
      email: email.toLowerCase().trim(),
      password: await hashPassword(password),
      phone: normalizePhoneInput(phone),
      institution: institution || null,
      country: country || null,
      userType: normalizeUserType(userType),
      role: 'user',
      status: 'active',
      isVerified: false,
      verificationCode,
      verificationToken,
      verificationExpires,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Insert user
    const result = await database.collection('users').insertOne(userData);
    console.log('✅ User registered:', userData.email);

    // Send verification email
  const emailSent = await sendVerificationEmail(userData.email, userData.fullName, verificationCode, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      userId: result.insertedId,
      emailSent
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again later.',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Change Password Endpoint
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const database = await connectDB();
    const { email, currentPassword, newPassword } = req.body;

    // Validation
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, current password, and new password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Find user
    const user = await database.collection('users').findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

  // Verify current password (supports legacy)
  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Update password (hashed)
    await database.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          password: await hashPassword(newPassword),
          updatedAt: new Date().toISOString()
        }
      }
    );

    console.log('✅ Password changed successfully for user:', user.email);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
      code: 'CHANGE_PASSWORD_ERROR'
    });
  }
});

// Forgot Password - request reset link
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const database = await connectDB();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    const user = await database.collection('users').findOne({ email: email.toLowerCase() });

    // Respond the same whether user exists or not to avoid information leakage
    if (!user) {
      return res.json({ success: true, message: 'If an account exists for this email, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await database.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires,
          updatedAt: new Date().toISOString()
        }
      }
    );

    await sendPasswordResetEmail(user.email, user.fullName, resetToken);

    res.json({ success: true, message: 'If an account exists for this email, a reset link has been sent.' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to process request', code: 'FORGOT_PASSWORD_ERROR' });
  }
});

// Validate reset token
app.get('/api/auth/reset-password/:token/validate', async (req, res) => {
  try {
    const database = await connectDB();
    const { token } = req.params;
    const user = await database.collection('users').findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    res.json({ valid: !!user });
  } catch (error) {
    console.error('❌ Validate reset token error:', error);
    res.status(500).json({ valid: false, error: 'Server error' });
  }
});

// Reset Password - set a new password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const database = await connectDB();
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    const user = await database.collection('users').findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
        code: 'INVALID_TOKEN'
      });
    }

  await database.collection('users').updateOne(
      { _id: user._id },
      {
    $set: { password: await hashPassword(newPassword), updatedAt: new Date().toISOString() },
        $unset: { resetPasswordToken: '', resetPasswordExpires: '' }
      }
    );

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password', code: 'RESET_PASSWORD_ERROR' });
  }
});

// === CUSTOM USER MANAGEMENT ENDPOINTS (for dashboard) ===

// Get all users (for dashboard)
app.get('/api/users', async (req, res) => {
  try {
    const database = await connectDB();
    const { page = 1, limit = 50, search, sortBy = 'createdAt', sortOrder = 'desc', userType: userTypeParam } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }
    // Optional filter by userType (supports aliases)
    if (userTypeParam && String(userTypeParam).toLowerCase() !== 'all') {
      const s = String(userTypeParam).toLowerCase().trim();
      let canonical = s;
      if (s === 'student' || s === 'academic' || s === 'student_academic') canonical = 'student_academic';
      else if (s === 'researcher' || s === 'professional' || s === 'researcher_professional') canonical = 'researcher_professional';
      query.userType = canonical;
    }
    
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };
    
    const [data, total] = await Promise.all([
      database.collection('users').find(query, options).toArray(),
      database.collection('users').countDocuments(query)
    ]);
    
    // Remove sensitive data from response
    const sanitizedData = data.map(user => ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      institution: user.institution,
      country: user.country,
      userType: user.userType,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      verifiedAt: user.verifiedAt
    }));
    
    res.json({
      data: sanitizedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      code: 'FETCH_ERROR'
    });
  }
});

// Users quick stats (counts by userType)
app.get('/api/users/stats', async (req, res) => {
  try {
    const database = await connectDB();
    const total = await database.collection('users').countDocuments({});
    const researchers = await database.collection('users').countDocuments({ userType: 'researcher_professional' });
    const students = await database.collection('users').countDocuments({ userType: 'student_academic' });
    res.json({ total, researchers, students });
  } catch (error) {
    console.error('❌ Get users stats error:', error);
    res.status(500).json({ error: 'Failed to fetch users stats', code: 'USERS_STATS_ERROR' });
  }
});

// Get single user by ID (for dashboard)
app.get('/api/users/:id', async (req, res) => {
  try {
    const database = await connectDB();
    const user = await database.collection('users').findOne({ 
      _id: parseId(req.params.id) 
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'NOT_FOUND'
      });
    }
    
    // Remove sensitive data
    const sanitizedUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      institution: user.institution,
      country: user.country,
      userType: user.userType,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      verifiedAt: user.verifiedAt
    };
    
    res.json(sanitizedUser);
  } catch (error) {
    console.error('❌ Get user by ID error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      code: 'FETCH_ERROR'
    });
  }
});

// Update user (for dashboard) - Note: password changes should be handled separately
app.put('/api/users/:id', async (req, res) => {
  try {
    const database = await connectDB();
    const { fullName, email, phone, role, status, institution, country, userType } = req.body;
    
    const updateData = {
      updatedAt: new Date().toISOString(),
      updatedBy: 'dashboard'
    };
    
    // Only update allowed fields
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (institution !== undefined) updateData.institution = institution;
    if (country !== undefined) updateData.country = country;
    if (userType !== undefined) {
      const normalizeUserType = (ut) => {
        if (!ut) return 'user';
        const s = String(ut).toLowerCase().trim();
        if (s === 'student_academic' || s === 'researcher_professional') return s;
        if (s.includes('student') || s.includes('academic')) return 'student_academic';
        if (s.includes('researcher') || s.includes('professional')) return 'researcher_professional';
        return s;
      };
      updateData.userType = normalizeUserType(userType);
    }
    
    const result = await database.collection('users').updateOne(
      { _id: parseId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'NOT_FOUND'
      });
    }

    // Fetch and return sanitized updated user
    const updated = await database.collection('users').findOne({ _id: parseId(req.params.id) });
    if (!updated) {
      return res.json({ success: true, message: 'User updated successfully' });
    }
    const sanitizedUser = {
      _id: updated._id,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      institution: updated.institution,
      country: updated.country,
      userType: updated.userType,
      role: updated.role,
      status: updated.status,
      isVerified: updated.isVerified,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      lastLoginAt: updated.lastLoginAt,
      verifiedAt: updated.verifiedAt
    };

    res.json({ 
      success: true,
      message: 'User updated successfully',
      user: sanitizedUser
    });
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      code: 'UPDATE_ERROR'
    });
  }
});

// Delete user (for dashboard)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const database = await connectDB();
    const result = await database.collection('users').deleteOne({ 
      _id: parseId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'NOT_FOUND'
      });
    }
    
    res.json({ 
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      code: 'DELETE_ERROR'
    });
  }
});

// === USER-SPECIFIC ENDPOINTS ===
// Custom endpoints for user dashboard functionality

// NOTE: User service orders endpoint moved to enhanced-service-orders-api-simple.js
// The enhanced version returns { success: true, orders: [...] } format with message stats

// GET user's tickets
app.get('/api/user/tickets', async (req, res) => {
  try {
    const database = await connectDB();
    const { userEmail, userId, limit = 50 } = req.query;
    
    let query = {};
    if (userEmail) {
      query.userEmail = userEmail;
    } else if (userId) {
      query.userId = userId;
    } else {
      // Try to get from auth token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          query.userEmail = decoded.email;
        } catch (err) {
          // For demo purposes, return empty array instead of error
          console.log('JWT verification failed, returning empty array');
          return res.json([]);
        }
      } else {
        // For demo purposes, return empty array instead of error
        console.log('No authentication provided, returning empty array');
        return res.json([]);
      }
    }
    
    const tickets = await database.collection('tickets')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET user dashboard stats
app.get('/api/user/stats', async (req, res) => {
  try {
    const database = await connectDB();
    const { userEmail, userId } = req.query;
    
    let query = {};
    if (userEmail) {
      query.userEmail = userEmail;
    } else if (userId) {
      query.userId = userId;
    } else {
      // Try to get from auth token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          query.userEmail = decoded.email;
        } catch (err) {
          // For demo purposes, return demo stats instead of error
          console.log('JWT verification failed, returning demo stats');
          return res.json({
            serviceOrders: 0,
            tickets: 0,
            conferences: 0,
            papers: 0
          });
        }
      } else {
        // For demo purposes, return demo stats instead of error
        console.log('No authentication provided, returning demo stats');
        return res.json({
          serviceOrders: 0,
          tickets: 0,
          conferences: 0,
          papers: 0
        });
      }
    }
    
    const [serviceOrders, tickets] = await Promise.all([
      database.collection('service-orders').countDocuments(query),
      database.collection('tickets').countDocuments(query)
    ]);
    
    res.json({
      serviceOrders,
      tickets,
      conferences: 0, // placeholder
      papers: 0 // placeholder
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      serviceOrders: 0,
      tickets: 0,
      conferences: 0,
      papers: 0
    });
  }
});

// === ADMIN-SPECIFIC ENDPOINTS ===
// Admin endpoints for dashboard management

// GET all service orders for admin view
app.get('/api/admin/service-orders', async (req, res) => {
  try {
    const database = await connectDB();
    const { page = 1, limit = 100, status, search, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.organization': { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get orders with customer information
    const orders = await database.collection('service-orders')
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Enhance orders with user information if customerInfo is missing
    const enhancedOrders = await Promise.all(orders.map(async (order) => {
      if (!order.customerInfo && order.userEmail) {
        try {
          const user = await database.collection('users').findOne({ email: order.userEmail });
          if (user) {
            order.customerInfo = {
              name: user.name || user.firstName + ' ' + user.lastName || 'Unknown Customer',
              email: user.email,
              phone: user.phone || user.mobile || 'Not provided',
              whatsapp: user.whatsapp || user.phone || user.mobile || null,
              country: user.country || 'Not provided',
              organization: user.organization || user.company || 'Not provided',
              designation: user.designation || user.position || user.title || 'Not provided'
            };
          }
        } catch (err) {
          console.log('Could not fetch user info for order:', order._id);
        }
      }
      
      // Ensure required fields exist
      return {
        ...order,
        customerInfo: order.customerInfo || {
          name: 'Unknown Customer',
          email: order.userEmail || 'No email',
          phone: 'Not provided',
          whatsapp: null,
          country: 'Not provided',
          organization: 'Not provided',
          designation: 'Not provided'
        },
        messages: order.messages || [],
        priceHistory: order.priceHistory || [{
          amount: order.totalAmount || order.originalAmount || 0,
          reason: 'Initial quote',
          changedBy: 'system',
          timestamp: order.submittedAt || order.createdAt || new Date().toISOString()
        }],
        communicationChannels: order.communicationChannels || {
          userpage: true,
          whatsapp: !!(order.customerInfo?.whatsapp),
          email: true
        },
        supportContact: order.supportContact || {
          whatsapp: '+1-234-567-8900',
          email: 'support@icsrt.com'
        }
      };
    }));
    
    // Get total count for pagination
    const total = await database.collection('service-orders').countDocuments(query);
    
    res.json({
      orders: enhancedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin service orders:', error);
    res.status(500).json({ error: 'Failed to fetch service orders' });
  }
});

// PUT update service order price (admin only)
app.put('/api/admin/service-orders/:id/price', async (req, res) => {
  try {
    const database = await connectDB();
    const { id } = req.params;
    const { newPrice, currency = 'USD', reason, changedBy = 'admin' } = req.body;
    
    if (!newPrice || !reason) {
      return res.status(400).json({ error: 'New price and reason are required' });
    }
    
    // Validate currency
    const validCurrencies = ['USD', 'EGP', 'SAR', 'AED'];
    const currencyCode = (currency || 'USD').toUpperCase();
    if (!validCurrencies.includes(currencyCode)) {
      return res.status(400).json({ error: `Invalid currency. Must be one of: ${validCurrencies.join(', ')}` });
    }
    
    const order = await database.collection('service-orders').findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Service order not found' });
    }
    
    // Calculate discount if applicable (only if same currency)
    const originalAmount = order.originalAmount || order.totalAmount;
    const originalCurrency = order.currency || 'USD';
    const discountApplied = (originalCurrency === currencyCode && originalAmount > newPrice) ? originalAmount - newPrice : 0;
    
    // Create price history entry
    const priceHistoryEntry = {
      amount: parseFloat(newPrice),
      currency: currencyCode,
      reason,
      changedBy,
      timestamp: new Date().toISOString()
    };
    
    // Currency symbols
    const currencySymbols = {
      'USD': '$',
      'EGP': 'EGP',
      'SAR': 'SAR',
      'AED': 'AED'
    };
    
    const oldSymbol = currencySymbols[originalCurrency] || originalCurrency;
    const newSymbol = currencySymbols[currencyCode] || currencyCode;
    
    // Create system message about price change
    const systemMessage = {
      id: `msg-${Date.now()}`,
      sender: 'system',
      channel: 'system',
      type: 'price-update',
      message: `Price updated from ${oldSymbol}${order.totalAmount} to ${newSymbol}${newPrice}. Reason: ${reason}`,
      timestamp: new Date().toISOString()
    };
    
    // Update the order
    const updateData = {
      totalAmount: parseFloat(newPrice),
      currency: currencyCode,
      originalAmount: originalAmount,
      originalCurrency: originalCurrency,
      discountApplied: discountApplied,
      discountReason: discountApplied > 0 ? reason : null,
      updatedAt: new Date().toISOString(),
      $push: {
        priceHistory: priceHistoryEntry,
        messages: systemMessage
      }
    };
    
    const result = await database.collection('service-orders').updateOne(
      { _id: new ObjectId(id) },
      updateData
    );
    
    if (result.modifiedCount === 1) {
      // Get the updated order
      const updatedOrder = await database.collection('service-orders').findOne({ 
        _id: new ObjectId(id) 
      });
      
      res.json({
        success: true,
        message: 'Price updated successfully',
        order: updatedOrder
      });
    } else {
      res.status(500).json({ error: 'Failed to update price' });
    }
  } catch (error) {
    console.error('Error updating service order price:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

// === AUTO-GENERATED CRUD ROUTES ===
const collections = [
  'services', 'service-orders', 'contact-requests', 'conferences', 'speakers', 'papers', 'journals',
  'contacts', 'about', 'mission', 'vision', 'events', 'news', 
  'testimonials', 'faq', 'gallery', 'home', 'admins', /* users removed (custom endpoints handle users) */ 'roles', 'social-links',
  // New collection for researcher collaboration proposals (Work With Us submissions)
  'collaborations'
];

function generateRoutes(collectionName) {
  // Skip users - handled by custom, sanitized endpoints above
  if (collectionName === 'users') return;
  // GET all items
  app.get(`/api/${collectionName}`, async (req, res) => {
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
      // Special filters for collaborations: allow filtering by userEmail or userId and status
      if (collectionName === 'collaborations') {
        const { userEmail, userId, status } = req.query;
        if (userEmail) query.userEmail = String(userEmail).toLowerCase();
        if (userId) query.userId = userId; // stored as string
        if (status && String(status).toLowerCase() !== 'all') {
          query.status = String(status).toLowerCase();
        }
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
      
      // Sanitize sensitive fields for admins collection
      const sanitizedData = (collectionName === 'admins')
        ? data.map(({ password, resetPasswordToken, resetPasswordExpires, ...rest }) => rest)
        : data;

      res.json({
        data: sanitizedData,
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
  app.get(`/api/${collectionName}/:id`, async (req, res) => {
    try {
      const database = await connectDB();
      const itemRaw = await database.collection(collectionName).findOne({ 
        _id: parseId(req.params.id) 
      });
      const item = (collectionName === 'admins' && itemRaw)
        ? (({ password, resetPasswordToken, resetPasswordExpires, ...rest }) => rest)(itemRaw)
        : itemRaw;

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
  app.post(`/api/${collectionName}`, requireAdmin, async (req, res) => {
    try {
      const database = await connectDB();
      const body = { ...req.body };
      // Hash password for admins if present
      if ((collectionName === 'admins') && body.password && !isHashedPassword(body.password)) {
        body.password = await hashPassword(body.password);
      }
      const newItem = {
        ...body,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        updatedAt: new Date().toISOString()
      };
      
      const result = await database.collection(collectionName).insertOne(newItem);
      
      // Auto-notify subscribers for new services, articles, or events
      if ((collectionName === 'services' || collectionName === 'news' || collectionName === 'articles' || collectionName === 'events') && newItem.title) {
        let type, title, description, link;
        
        if (collectionName === 'services') {
          type = 'service';
          title = newItem.title || newItem.titleEn || newItem.name;
          description = newItem.description || newItem.excerpt || newItem.descriptionEn || 'A new research service is now available!';
          link = `${getFrontendUrl()}/services`;
        } else if (collectionName === 'events') {
          type = 'event';
          title = newItem.title || newItem.titleEn || newItem.name;
          description = newItem.description || newItem.excerpt || newItem.descriptionEn || 'A new event has been announced!';
          link = `${getFrontendUrl()}/events`;
        } else {
          type = 'article';
          title = newItem.title || newItem.titleEn || newItem.name;
          description = newItem.description || newItem.excerpt || newItem.descriptionEn || 'A new article has been published!';
          link = `${getFrontendUrl()}/news`;
        }
        
        // Don't wait for email sending - fire and forget
        setImmediate(() => {
          notifySubscribersOfNewContent(type, title, description, link).catch(err => {
            console.warn(`Failed to send ${type} notifications:`, err.message);
          });
        });
        
        console.log(`📧 Queued ${type} notification: "${title}"`);
      }
      
      // Sanitize sensitive fields before returning
      const { password, resetPasswordToken, resetPasswordExpires, ...safeData } = newItem;
      res.status(201).json({ 
        success: true,
        id: result.insertedId,
        message: `${collectionName} created successfully`,
        data: { ...safeData, _id: result.insertedId }
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
  app.put(`/api/${collectionName}/:id`, requireAdmin, async (req, res) => {
    try {
      const database = await connectDB();
      const body = { ...req.body };
      if ((collectionName === 'admins') && body.password) {
        body.password = isHashedPassword(body.password) ? body.password : await hashPassword(body.password);
      }
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
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
  app.delete(`/api/${collectionName}/:id`, requireAdmin, async (req, res) => {
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

// === FILE UPLOAD ENDPOINT ===
// IMPORTANT: Must be defined BEFORE auto-generated routes to prevent conflicts
try {
  const multer = require('multer');
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
      cb(null, `${base}-${uniqueSuffix}${ext}`);
    }
  });
  const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
      const allowed = [
        // images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        // documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Only image or document files (pdf, doc, docx, ppt, pptx, xls, xlsx) are allowed'));
    }
  });

  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const base = process.env.API_BASE_URL || `${req.protocol}://${req.headers.host}`;
    const url = `${base}/uploads/${req.file.filename}`;
    res.json({ success: true, url, filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype });
  });

  // Service orders with file attachments
  app.post('/api/service-orders', upload.array('attachments', 10), async (req, res) => {
    try {
      console.log('📝 Service order request received');
      console.log('📦 Request body:', req.body);
      console.log('📎 Files:', req.files ? req.files.length : 0);
      
      const database = await connectDB();
      
      // Parse form data
      const orderData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        serviceType: req.body.serviceType,
        projectDetails: req.body.projectDetails,
        urgency: req.body.urgency || 'normal',
        userId: req.body.userId,
        userEmail: req.body.userEmail,
        submittedAt: req.body.submittedAt || new Date().toISOString(),
        status: req.body.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('💾 Order data to save:', JSON.stringify(orderData, null, 2));

      // Handle file attachments
      if (req.files && req.files.length > 0) {
        const base = process.env.API_BASE_URL || `${req.protocol}://${req.headers.host}`;
        orderData.attachments = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          url: `${base}/uploads/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
          uploadedAt: new Date().toISOString()
        }));
      } else {
        orderData.attachments = [];
      }

      // Generate order number
      const count = await database.collection('service-orders').countDocuments();
      orderData.orderNumber = `ORD-${Date.now()}-${count + 1}`;

      // Insert the order
      const result = await database.collection('service-orders').insertOne(orderData);
      
      console.log('✅ Service order created:', orderData.orderNumber);
      res.json({
        success: true,
        orderId: result.insertedId,
        orderNumber: orderData.orderNumber,
        message: 'Service order created successfully'
      });
    } catch (error) {
      console.error('❌ Error creating service order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create service order',
        message: error.message
      });
    }
  });

  // GET all service orders (with admin auth)
  app.get('/api/service-orders', requireAdmin, async (req, res) => {
    try {
      const database = await connectDB();
      const orders = await database.collection('service-orders')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.json(orders);
    } catch (error) {
      console.error('❌ Error fetching service orders:', error);
      res.status(500).json({ error: 'Failed to fetch service orders' });
    }
  });

  // GET single service order by ID (with admin auth)
  app.get('/api/service-orders/:id', requireAdmin, async (req, res) => {
    try {
      const database = await connectDB();
      const order = await database.collection('service-orders')
        .findOne({ _id: parseId(req.params.id) });
      
      if (!order) {
        return res.status(404).json({ error: 'Service order not found' });
      }
      
      res.json(order);
    } catch (error) {
      console.error('❌ Error fetching service order:', error);
      res.status(500).json({ error: 'Failed to fetch service order' });
    }
  });

  // PUT update service order (with admin auth)
  app.put('/api/service-orders/:id', requireAdmin, async (req, res) => {
    try {
      const database = await connectDB();
      const updateData = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      // Don't allow overwriting attachments through regular update
      delete updateData.attachments;
      
      const result = await database.collection('service-orders').updateOne(
        { _id: parseId(req.params.id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Service order not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'Service order updated successfully' 
      });
    } catch (error) {
      console.error('❌ Error updating service order:', error);
      res.status(500).json({ error: 'Failed to update service order' });
    }
  });

  // DELETE service order (with admin auth)
  app.delete('/api/service-orders/:id', requireAdmin, async (req, res) => {
    try {
      const database = await connectDB();
      const result = await database.collection('service-orders').deleteOne(
        { _id: parseId(req.params.id) }
      );
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Service order not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'Service order deleted successfully' 
      });
    } catch (error) {
      console.error('❌ Error deleting service order:', error);
      res.status(500).json({ error: 'Failed to delete service order' });
    }
  });

  console.log('✅ File upload endpoint enabled at POST /api/upload');
  console.log('✅ Service orders endpoints enabled (GET, POST, PUT, DELETE /api/service-orders)');
} catch (e) {
  console.warn('⚠️ Multer not installed; file upload endpoint disabled. Run npm install in icsrt-db.');
}
// Generate routes for all collections
collections.forEach(generateRoutes);

// === UTILITY ENDPOINTS ===

// === FILE UPLOAD ENDPOINT ===

// Health check
app.get('/api/health', (req, res) => {
  // Check email configuration status
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailConfigured = emailUser && emailPass && 
                          emailUser !== 'your-email@gmail.com' && 
                          emailPass !== 'your-app-password-here';
  
  res.json({
    health: 'healthy',
    database: DATABASE_NAME || "icsrt_main",
    uptime: process.uptime(),
    success: true,
    status: 'Backend running fine ✅',
    message: 'ICSRT Backend is running correctly 🚀',
    email: {
      configured: emailConfigured,
      status: emailConfigured ? 'Email service active' : 'Email service disabled (development mode)',
      warning: !emailConfigured ? 'Set EMAIL_USER and EMAIL_PASS in .env file to enable email features' : null
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Contact API test endpoint
app.get('/api/contacts/test', (req, res) => {
  console.log('🧪 Contact test endpoint called');
  res.json({
    success: true,
    message: 'Contact API endpoint is working',
    testData: [
      {
        _id: 'test1',
        name: 'Test Contact',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        createdAt: new Date()
      }
    ]
  });
});

// Track visitor endpoint
app.post('/api/track-visitor', async (req, res) => {
  try {
    console.log('📊 Visitor tracking request received');
    const { page, userAgent, timestamp } = req.body;
    
    const database = await connectDB();
    const visitorData = {
      page: page || 'unknown',
      userAgent: userAgent || req.headers['user-agent'] || 'unknown',
      timestamp: timestamp || new Date(),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      createdAt: new Date()
    };
    
    await database.collection('visitors').insertOne(visitorData);
    
    res.json({
      success: true,
      message: 'Visitor tracked successfully'
    });
  } catch (error) {
    console.error('❌ Error tracking visitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track visitor'
    });
  }
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const database = await connectDB();
    const userCount = await database.collection('users').countDocuments();
    res.json({
      status: 'connected',
      database: DATABASE_NAME || "icsrt_main",
      userCount
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// === ERROR HANDLING MIDDLEWARE ===

// === NEWSLETTER ENDPOINTS ===
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email, name, preferences } = req.body;
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        error: 'Valid email address is required' 
      });
    }
    
    const database = await connectDB();
    const newsletterCollection = database.collection('newsletter_subscribers');
    
    // Check if email already exists
    const existingSubscriber = await newsletterCollection.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.status === 'unsubscribed') {
        // Reactivate subscription
        await newsletterCollection.updateOne(
          { email: email.toLowerCase() },
          { 
            $set: { 
              status: 'active',
              subscribedAt: new Date(),
              preferences: preferences || ['services', 'articles'],
              name: name || existingSubscriber.name
            }
          }
        );
        return res.json({ message: 'Successfully resubscribed to newsletter!' });
      } else {
        return res.status(400).json({ 
          error: 'Email is already subscribed to our newsletter' 
        });
      }
    }
    
    // Create new subscription
    const subscription = {
      email: email.toLowerCase(),
      name: name || '',
      preferences: preferences || ['services', 'articles'], // services, articles, events, conferences
      status: 'active',
      subscribedAt: new Date(),
      source: 'website',
      emailsSent: 0,
      lastEmailSent: null
    };
    
    await newsletterCollection.insertOne(subscription);
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email, name || '');
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError.message);
    }
    
    res.json({ 
      message: 'Successfully subscribed to newsletter!',
      subscription: {
        email: subscription.email,
        preferences: subscription.preferences,
        subscribedAt: subscription.subscribedAt
      }
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
});

app.post('/api/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const database = await connectDB();
    const newsletterCollection = database.collection('newsletter_subscribers');
    
    const result = await newsletterCollection.updateOne(
      { email: email.toLowerCase() },
      { 
        $set: { 
          status: 'unsubscribed',
          unsubscribedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Email not found in our newsletter' });
    }
    
    res.json({ message: 'Successfully unsubscribed from newsletter' });
    
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
  }
});

app.get('/api/newsletter/subscribers', async (req, res) => {
  try {
    const database = await connectDB();
    const newsletterCollection = database.collection('newsletter_subscribers');
    const usersCollection = database.collection('users');
    
    const { status = 'active', page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = status !== 'all' ? { status } : {};
    
    // Get newsletter subscribers
    const subscribers = await newsletterCollection
      .find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Get existing users and add them to newsletter if they aren't already
    const users = await usersCollection.find({ verified: true }).toArray();
    let addedFromUsers = 0;
    
    for (const user of users) {
      const existingSubscriber = await newsletterCollection.findOne({ email: user.email.toLowerCase() });
      if (!existingSubscriber) {
        await newsletterCollection.insertOne({
          email: user.email.toLowerCase(),
          name: user.fullName || '',
          preferences: ['services', 'articles', 'events'],
          status: 'active',
          subscribedAt: new Date(user.createdAt || new Date()),
          source: 'existing_user',
          emailsSent: 0,
          lastEmailSent: null
        });
        addedFromUsers++;
      }
    }
    
    // Get total count including newly added users
    const total = await newsletterCollection.countDocuments(query);
    
    if (addedFromUsers > 0) {
      console.log(`📧 Added ${addedFromUsers} existing users to newsletter subscribers`);
    }
    
    res.json({
      subscribers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      addedFromUsers
    });
    
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

app.post('/api/newsletter/send', async (req, res) => {
  try {
    const { subject, content, type, targetPreference } = req.body;
    
    if (!subject || !content || !type) {
      return res.status(400).json({ 
        error: 'Subject, content, and type are required' 
      });
    }
    
    const database = await connectDB();
    const newsletterCollection = database.collection('newsletter_subscribers');
    
    // Get active subscribers with the target preference
    const query = { 
      status: 'active',
      ...(targetPreference && { preferences: targetPreference })
    };
    
    const subscribers = await newsletterCollection.find(query).toArray();
    
    if (subscribers.length === 0) {
      return res.status(400).json({ 
        error: 'No active subscribers found for this preference' 
      });
    }
    
    // Send emails to all subscribers
    let successCount = 0;
    let failCount = 0;
    
    for (const subscriber of subscribers) {
      try {
        await sendNewsletterEmail(subscriber.email, subscriber.name, subject, content, type);
        successCount++;
        
        // Update email sent count
        await newsletterCollection.updateOne(
          { _id: subscriber._id },
          { 
            $inc: { emailsSent: 1 },
            $set: { lastEmailSent: new Date() }
          }
        );
      } catch (emailError) {
        console.warn(`Failed to send email to ${subscriber.email}:`, emailError.message);
        failCount++;
      }
    }
    
    // Log the email campaign
    await database.collection('newsletter_campaigns').insertOne({
      subject,
      content,
      type,
      targetPreference,
      totalSubscribers: subscribers.length,
      successCount,
      failCount,
      sentAt: new Date()
    });
    
    res.json({
      message: `Newsletter sent successfully!`,
      totalSubscribers: subscribers.length,
      successCount,
      failCount
    });
    
  } catch (error) {
    console.error('Newsletter send error:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
});

// === WHATSAPP CONFIGURATION ENDPOINTS ===

// Get WhatsApp configuration
app.get('/api/whatsapp-config', async (req, res) => {
  try {
    const database = await connectDB();
    const config = await database.collection('whatsapp_config').findOne({});
    
    if (!config) {
      return res.json({ phoneNumber: '', enabled: false });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error);
    res.status(500).json({ error: 'Failed to fetch WhatsApp configuration' });
  }
});

// Save WhatsApp configuration
app.post('/api/whatsapp-config', async (req, res) => {
  try {
    const { phoneNumber, enabled } = req.body;
    
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }
    
    // Validate phone number format (should start with +)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ 
        error: 'Phone number must be in international format (e.g., +1234567890)' 
      });
    }
    
    const database = await connectDB();
    const config = {
      phoneNumber: phoneNumber.trim(),
      enabled: Boolean(enabled),
      updatedAt: new Date()
    };
    
    await database.collection('whatsapp_config').replaceOne({}, config, { upsert: true });
    
    res.json({ message: 'WhatsApp configuration saved successfully', config });
  } catch (error) {
    console.error('Error saving WhatsApp config:', error);
    res.status(500).json({ error: 'Failed to save WhatsApp configuration' });
  }
});

// Test WhatsApp configuration endpoint
app.get('/api/test-whatsapp', async (req, res) => {
  try {
    const database = await connectDB();
    const config = await database.collection('whatsapp_config').findOne({});
    
    res.json({
      hasConfig: !!config,
      config: config || null,
      message: config ? 'WhatsApp is configured' : 'WhatsApp not configured'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get WhatsApp notifications (for admin dashboard)
app.get('/api/whatsapp-notifications', async (req, res) => {
  try {
    const database = await connectDB();
    const notifications = await database.collection('whatsapp_notifications')
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching WhatsApp notifications:', error);
    res.status(500).json({ error: 'Failed to fetch WhatsApp notifications' });
  }
});

// === WHATSAPP SERVICE CONTROL ENDPOINTS ===

// Get WhatsApp service status
app.get('/api/whatsapp-status', async (req, res) => {
  try {
    const status = whatsappService.getStatus();
    res.json({
      ...status,
      message: status.isReady ? 'WhatsApp service is ready for automatic sending' : 
               status.isInitializing ? 'WhatsApp service is initializing...' :
               'WhatsApp service is not connected'
    });
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    res.status(500).json({ error: 'Failed to get WhatsApp status' });
  }
});

// Initialize WhatsApp service
app.post('/api/whatsapp-initialize', async (req, res) => {
  try {
    console.log('🚀 Starting WhatsApp service initialization...');
    await whatsappService.initialize();
    
    res.json({ 
      message: 'WhatsApp service initialization started. Check console for QR code to scan.',
      status: whatsappService.getStatus()
    });
  } catch (error) {
    console.error('Error initializing WhatsApp service:', error);
    res.status(500).json({ error: 'Failed to initialize WhatsApp service: ' + error.message });
  }
});

// Stop WhatsApp service
app.post('/api/whatsapp-stop', async (req, res) => {
  try {
    console.log('🛑 Stopping WhatsApp service...');
    await whatsappService.destroy();
    
    res.json({ 
      message: 'WhatsApp service stopped successfully',
      status: whatsappService.getStatus()
    });
  } catch (error) {
    console.error('Error stopping WhatsApp service:', error);
    res.status(500).json({ error: 'Failed to stop WhatsApp service: ' + error.message });
  }
});

// === CONTACT REQUESTS ENDPOINTS ===

// Get contact requests (for admin dashboard) - SIMPLIFIED VERSION
app.get('/api/contact-requests', async (req, res) => {
  console.log('📥 Contact-requests API called at:', new Date().toISOString());
  
  try {
    const database = await connectDB();
    if (!database) {
      throw new Error('Database not connected');
    }
    
    // Try to get contacts from contact_requests first (underscore)
    let requests = await database.collection('contact_requests').find({}).sort({ timestamp: -1, createdAt: -1 }).toArray();
    
    // If no data, try contact-requests (hyphen)
    if (requests.length === 0) {
      requests = await database.collection('contact-requests').find({}).sort({ timestamp: -1, createdAt: -1 }).toArray();
    }
    
    // If still no data, try just 'contacts'
    if (requests.length === 0) {
      requests = await database.collection('contacts').find({}).sort({ timestamp: -1, createdAt: -1 }).toArray();
    }
    
    console.log(`📊 Found ${requests.length} contact requests`);
    res.json(requests || []);
    
  } catch (error) {
    console.error('❌ Error fetching contact requests:', error);
    res.status(500).json({ error: 'Failed to fetch contact requests' });
  }
});

// Create new contact request
app.post('/api/contact-requests', async (req, res) => {
  try {
    const { name, email, subject, message, category, userId, timestamp, phone } = req.body;
    
    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        error: 'Name, email, subject, and message are required' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    const database = await connectDB();
    
    // If userId is provided, get user's phone number and other details
    let userPhone = phone; // Use provided phone first
    let userDetails = null;
    
    if (userId) {
      try {
        userDetails = await database.collection('users').findOne(
          { _id: parseId(userId) },
          { projection: { phone: 1, fullName: 1, email: 1 } }
        );
        
        if (userDetails) {
          // Use user's phone number if not provided in the request
          if (!userPhone && userDetails.phone) {
            userPhone = userDetails.phone;
            console.log(`📱 Using user's phone number: ${userPhone} for ${userDetails.fullName}`);
          }
          
          // Verify email matches
          if (userDetails.email.toLowerCase() !== email.toLowerCase()) {
            console.warn(`⚠️ Email mismatch: User ${userId} has ${userDetails.email}, request has ${email}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not fetch user details for userId: ${userId}`, error.message);
      }
    }
    
    // If still no phone and we have an email, try to find user by email
    if (!userPhone && email) {
      try {
        const userByEmail = await database.collection('users').findOne(
          { email: email.toLowerCase() },
          { projection: { phone: 1, fullName: 1, _id: 1 } }
        );
        
        if (userByEmail && userByEmail.phone) {
          userPhone = userByEmail.phone;
          console.log(`📱 Found user phone by email: ${userPhone} for ${userByEmail.fullName}`);
          
          // Update userId if it wasn't provided but we found the user
          if (!userId) {
            userId = userByEmail._id;
            console.log(`👤 Set userId from email lookup: ${userId}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not find user by email: ${email}`, error.message);
      }
    }
    
    const contactRequest = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      phone: userPhone || null, // Store the found/provided phone number
      category: category || 'general',
      userId: userId || null,
      timestamp: timestamp || new Date(),
      status: 'unread',
      createdAt: new Date()
    };
    
    const result = await database.collection('contact_requests').insertOne(contactRequest);
    contactRequest._id = result.insertedId;
    
    console.log('✅ Contact request created:', contactRequest._id);
    console.log('👤 From:', contactRequest.name, '(' + contactRequest.email + ')');
    console.log('📱 Phone:', contactRequest.phone || 'Not available');
    console.log('📝 Subject:', contactRequest.subject);
    
    // Send to WhatsApp if configured
    console.log('📱 Attempting to send WhatsApp notification...');
    await sendToWhatsApp(contactRequest);
    
    res.status(201).json({ 
      message: 'Contact request submitted successfully',
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating contact request:', error);
    res.status(500).json({ error: 'Failed to submit contact request' });
  }
});

// Function to send contact request to WhatsApp
async function sendToWhatsApp(contactRequest) {
  try {
    console.log('🔍 Checking WhatsApp configuration...');
    const database = await connectDB();
    const config = await database.collection('whatsapp_config').findOne({});
    
    console.log('📋 Config found:', !!config);
    if (config) {
      console.log('📞 Phone:', config.phoneNumber);
      console.log('✅ Enabled:', config.enabled);
    }
    
    if (!config || !config.enabled || !config.phoneNumber) {
      console.log('❌ WhatsApp not configured or disabled');
      return;
    }
    
    // Format the message
    const whatsappMessage = `🔔 New Contact Form Message

👤 Name: ${contactRequest.name}
📧 Email: ${contactRequest.email}
📂 Category: ${contactRequest.category}
📝 Subject: ${contactRequest.subject}

💬 Message:
${contactRequest.message}

⏰ Received: ${new Date(contactRequest.timestamp).toLocaleString()}

---
ICSRT Contact System`;
    
    // Try to send automatically using WhatsApp Web API
    let automaticSendResult = null;
    let whatsappUrl = null;
    
    try {
      console.log('🚀 Attempting automatic WhatsApp send...');
      
      // Check if WhatsApp service is ready
      const status = whatsappService.getStatus();
      console.log('📱 WhatsApp Service Status:', status);
      
      if (status.isReady) {
        // Send automatically
        automaticSendResult = await whatsappService.sendMessage(config.phoneNumber, whatsappMessage);
        console.log('✅ AUTOMATIC MESSAGE SENT SUCCESSFULLY!');
        console.log('📧 Message ID:', automaticSendResult.messageId);
      } else {
        console.log('⚠️ WhatsApp client not ready, falling back to URL generation...');
      }
    } catch (autoError) {
      console.log('⚠️ Automatic send failed, falling back to URL generation:', autoError.message);
    }
    
    // Always generate fallback URL as backup
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const phoneNumber = config.phoneNumber.replace('+', '');
    whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Log notification details
    console.log('📱 WhatsApp notification processed:');
    console.log(`📞 Phone: ${config.phoneNumber}`);
    console.log(`📝 Subject: ${contactRequest.subject}`);
    console.log(`👤 From: ${contactRequest.name} (${contactRequest.email})`);
    
    if (automaticSendResult) {
      console.log('✅ STATUS: Message sent automatically!');
    } else {
      console.log('🔗 FALLBACK URL: ' + whatsappUrl);
      console.log('� Manual Action Required: Check dashboard for WhatsApp notifications');
    }
    console.log('---');
    
    // Store the notification in database for admin dashboard
    await database.collection('whatsapp_notifications').insertOne({
      contactRequestId: contactRequest._id,
      phoneNumber: config.phoneNumber,
      message: whatsappMessage,
      url: whatsappUrl,
      status: automaticSendResult ? 'sent_automatically' : 'generated',
      automaticSend: !!automaticSendResult,
      messageId: automaticSendResult?.messageId || null,
      createdAt: new Date()
    });
    
    if (automaticSendResult) {
      console.log('🎉 Message delivered automatically via WhatsApp Web!');
    } else {
      console.log('📋 WhatsApp notification stored - manual sending required via dashboard');
    }
    
  } catch (error) {
    console.error('❌ Error sending to WhatsApp:', error);
  }
}

// Mark contact request as read
app.patch('/api/contact-requests/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await connectDB();
    
    const result = await database.collection('contact_requests').updateOne(
      { _id: parseId(id) },
      { 
        $set: { 
          status: 'read',
          readAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contact request not found' });
    }
    
    res.json({ message: 'Contact request marked as read' });
  } catch (error) {
    console.error('Error updating contact request:', error);
    res.status(500).json({ error: 'Failed to update contact request' });
  }
});

// Delete contact request
app.delete('/api/contact-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await connectDB();
    
    console.log(`🗑️ Attempting to delete contact request with ID: ${id}`);
    
    let result = null;
    let collectionUsed = '';
    
    // Try to delete from contact_requests first (underscore)
    result = await database.collection('contact_requests').deleteOne({ _id: parseId(id) });
    if (result.deletedCount > 0) {
      collectionUsed = 'contact_requests';
    } else {
      // Try contact-requests (hyphen)
      result = await database.collection('contact-requests').deleteOne({ _id: parseId(id) });
      if (result.deletedCount > 0) {
        collectionUsed = 'contact-requests';
      } else {
        // Try just 'contacts'
        result = await database.collection('contacts').deleteOne({ _id: parseId(id) });
        if (result.deletedCount > 0) {
          collectionUsed = 'contacts';
        }
      }
    }
    
    if (result.deletedCount === 0) {
      console.log(`❌ Contact request not found for ID: ${id}`);
      return res.status(404).json({ error: 'Contact request not found' });
    }
    
    console.log(`✅ Contact request deleted successfully from collection: ${collectionUsed}`);
    res.json({ 
      message: 'Contact request deleted successfully',
      collection: collectionUsed
    });
  } catch (error) {
    console.error('❌ Error deleting contact request:', error);
    res.status(500).json({ error: 'Failed to delete contact request' });
  }
});

// Reply to contact request via WhatsApp
app.post('/api/contact-requests/:id/reply-whatsapp', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const database = await connectDB();
    
    // Find the contact request first
    let contactRequest = null;
    let collectionUsed = '';
    
    // Try to find in contact_requests first (underscore)
    contactRequest = await database.collection('contact_requests').findOne({ _id: parseId(id) });
    if (contactRequest) {
      collectionUsed = 'contact_requests';
    } else {
      // Try contact-requests (hyphen)
      contactRequest = await database.collection('contact-requests').findOne({ _id: parseId(id) });
      if (contactRequest) {
        collectionUsed = 'contact-requests';
      } else {
        // Try just 'contacts'
        contactRequest = await database.collection('contacts').findOne({ _id: parseId(id) });
        if (contactRequest) {
          collectionUsed = 'contacts';
        }
      }
    }
    
    if (!contactRequest) {
      return res.status(404).json({ error: 'Contact request not found' });
    }
    
    if (!contactRequest.phone) {
      return res.status(400).json({ error: 'No phone number available for this contact' });
    }
    
    console.log(`📱 Replying to ${contactRequest.name} at ${contactRequest.phone}`);
    
    // Check WhatsApp service status
    const whatsappStatus = whatsappService.getStatus();
    if (!whatsappStatus.isReady) {
      return res.status(503).json({ 
        error: 'WhatsApp service is not ready. Please initialize WhatsApp service first.',
        needsInitialization: true
      });
    }
    
    // Send WhatsApp message
    try {
      // Format phone number (remove non-digits and ensure it starts with country code)
      let phoneNumber = contactRequest.phone.replace(/\D/g, '');
      
      // If phone doesn't start with country code, you might want to add a default one
      // For now, we'll assume the phone number is properly formatted
      if (!phoneNumber.startsWith('1') && !phoneNumber.startsWith('2') && !phoneNumber.startsWith('3') && 
          !phoneNumber.startsWith('4') && !phoneNumber.startsWith('5') && !phoneNumber.startsWith('6') && 
          !phoneNumber.startsWith('7') && !phoneNumber.startsWith('8') && !phoneNumber.startsWith('9')) {
        // This is a simple check - you might want to implement proper country code detection
        console.warn('⚠️ Phone number might be missing country code:', phoneNumber);
      }
      
      // Create the WhatsApp number format
      const whatsappNumber = phoneNumber + '@c.us';
      
      const replyMessage = `Hello ${contactRequest.name},\n\nThank you for contacting ICSRT regarding: "${contactRequest.subject}"\n\n${message.trim()}\n\n---\nICSRT Support Team`;
      
      // Send via WhatsApp service
      const success = await whatsappService.sendMessage(whatsappNumber, replyMessage);
      
      if (success) {
        // Log the reply in database
        await database.collection('whatsapp_replies').insertOne({
          contactRequestId: contactRequest._id,
          contactName: contactRequest.name,
          contactPhone: contactRequest.phone,
          replyMessage: message.trim(),
          fullMessage: replyMessage,
          sentAt: new Date(),
          sentBy: 'admin', // You can modify this to track which admin sent it
          status: 'sent'
        });
        
        // Update the contact request to mark as replied
        await database.collection(collectionUsed).updateOne(
          { _id: parseId(id) },
          { 
            $set: { 
              status: 'replied',
              repliedAt: new Date(),
              lastReply: message.trim()
            }
          }
        );
        
        console.log(`✅ WhatsApp reply sent successfully to ${contactRequest.name}`);
        
        res.json({
          success: true,
          message: 'Reply sent successfully via WhatsApp',
          sentTo: contactRequest.phone,
          contactName: contactRequest.name
        });
      } else {
        throw new Error('Failed to send WhatsApp message');
      }
      
    } catch (whatsappError) {
      console.error('❌ Failed to send WhatsApp reply:', whatsappError);
      
      // Log the failed attempt
      await database.collection('whatsapp_replies').insertOne({
        contactRequestId: contactRequest._id,
        contactName: contactRequest.name,
        contactPhone: contactRequest.phone,
        replyMessage: message.trim(),
        error: whatsappError.message,
        sentAt: new Date(),
        sentBy: 'admin',
        status: 'failed'
      });
      
      res.status(500).json({
        error: 'Failed to send WhatsApp reply',
        details: whatsappError.message
      });
    }
    
  } catch (error) {
    console.error('Error sending WhatsApp reply:', error);
    res.status(500).json({ error: 'Failed to process WhatsApp reply' });
  }
});

// Get WhatsApp reply history for a contact request
app.get('/api/contact-requests/:id/whatsapp-replies', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await connectDB();
    
    const replies = await database.collection('whatsapp_replies')
      .find({ contactRequestId: parseId(id) })
      .sort({ sentAt: -1 })
      .toArray();
    
    res.json(replies);
  } catch (error) {
    console.error('Error fetching WhatsApp replies:', error);
    res.status(500).json({ error: 'Failed to fetch WhatsApp replies' });
  }
});

// Get WhatsApp chat URL for direct messaging (SIMPLIFIED VERSION)
app.get('/api/contact-requests/:id/whatsapp-url', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await connectDB();
    
    // Find the contact request
    let contactRequest = null;
    
    // Try different collection names
    contactRequest = await database.collection('contact_requests').findOne({ _id: parseId(id) });
    if (!contactRequest) {
      contactRequest = await database.collection('contact-requests').findOne({ _id: parseId(id) });
      if (!contactRequest) {
        contactRequest = await database.collection('contacts').findOne({ _id: parseId(id) });
      }
    }
    
    if (!contactRequest) {
      return res.status(404).json({ error: 'Contact request not found' });
    }
    
    if (!contactRequest.phone) {
      return res.status(400).json({ error: 'No phone number available for this contact' });
    }
    
    // Format phone number (remove non-digits)
    let phoneNumber = contactRequest.phone.replace(/\D/g, '');
    
    // Remove leading zero if present
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.substring(1);
    }
    
    // Add country code if missing (customize based on your country)
    if (!phoneNumber.startsWith('1') && !phoneNumber.startsWith('2') && !phoneNumber.startsWith('3') && 
        !phoneNumber.startsWith('4') && !phoneNumber.startsWith('5') && !phoneNumber.startsWith('6') && 
        !phoneNumber.startsWith('7') && !phoneNumber.startsWith('8') && !phoneNumber.startsWith('9')) {
      // Default country code - customize this for your country
      phoneNumber = '20' + phoneNumber; // Egypt example
    }
    
    // Create pre-filled message
    const message = `Hello ${contactRequest.name}! Thank you for contacting ICSRT regarding: "${contactRequest.subject}". How can we help you?`;
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    console.log(`📱 Generated WhatsApp URL for ${contactRequest.name}: ${whatsappUrl}`);
    
    res.json({
      success: true,
      whatsappUrl: whatsappUrl,
      phoneNumber: phoneNumber,
      contactName: contactRequest.name,
      message: `WhatsApp URL generated successfully`
    });
    
  } catch (error) {
    console.error('Error generating WhatsApp URL:', error);
    res.status(500).json({ error: 'Failed to generate WhatsApp URL' });
  }
});

// Get WhatsApp chat URL for direct messaging
app.get('/api/contact-requests/:id/whatsapp-chat', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await connectDB();
    
    // Find the contact request first
    let contactRequest = null;
    
    // Try to find in contact_requests first (underscore)
    contactRequest = await database.collection('contact_requests').findOne({ _id: parseId(id) });
    if (!contactRequest) {
      // Try contact-requests (hyphen)
      contactRequest = await database.collection('contact-requests').findOne({ _id: parseId(id) });
      if (!contactRequest) {
        // Try just 'contacts'
        contactRequest = await database.collection('contacts').findOne({ _id: parseId(id) });
      }
    }
    
    if (!contactRequest) {
      return res.status(404).json({ error: 'Contact request not found' });
    }
    
    if (!contactRequest.phone) {
      return res.status(400).json({ error: 'No phone number available for this contact' });
    }
    
    // Format phone number for WhatsApp (remove non-digits)
    let phoneNumber = contactRequest.phone.replace(/\D/g, '');
    
    // Remove leading zeros and ensure proper format
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.substring(1);
    }
    
    // Add country code if missing (you might want to customize this based on your country)
    if (!phoneNumber.startsWith('1') && !phoneNumber.startsWith('2') && !phoneNumber.startsWith('3') && 
        !phoneNumber.startsWith('4') && !phoneNumber.startsWith('5') && !phoneNumber.startsWith('6') && 
        !phoneNumber.startsWith('7') && !phoneNumber.startsWith('8') && !phoneNumber.startsWith('9')) {
      // Assuming default country code - you can customize this
      phoneNumber = '20' + phoneNumber; // Egypt country code as example
    }
    
    // Create WhatsApp chat URL
    const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}`;
    const whatsappAppUrl = `https://wa.me/${phoneNumber}`;
    
    // Create a pre-filled message
    const preMessage = `Hello ${contactRequest.name}, Thank you for contacting ICSRT regarding: "${contactRequest.subject}". How can we help you?`;
    const encodedMessage = encodeURIComponent(preMessage);
    
    const whatsappWebUrlWithMessage = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    const whatsappAppUrlWithMessage = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    console.log(`📱 Generated WhatsApp URLs for ${contactRequest.name} (${contactRequest.phone})`);
    console.log(`🔗 App URL: ${whatsappAppUrlWithMessage}`);
    
    res.json({
      success: true,
      contactInfo: {
        name: contactRequest.name,
        originalPhone: contactRequest.phone,
        formattedPhone: phoneNumber,
        subject: contactRequest.subject
      },
      whatsappUrls: {
        app: whatsappAppUrl,
        appWithMessage: whatsappAppUrlWithMessage,
        web: whatsappWebUrl,
        webWithMessage: whatsappWebUrlWithMessage
      },
      directChatUrl: whatsappAppUrlWithMessage, // Main URL to use
      message: `WhatsApp chat URL generated for ${contactRequest.name}`
    });
    
  } catch (error) {
    console.error('Error generating WhatsApp chat URL:', error);
    res.status(500).json({ error: 'Failed to generate WhatsApp chat URL' });
  }
});

// Test WhatsApp phone number formatting
app.post('/api/test-whatsapp-number', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Format phone number (remove non-digits)
    let formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Create the WhatsApp number format
    const whatsappNumber = formattedNumber + '@c.us';
    
    res.json({
      original: phoneNumber,
      formatted: formattedNumber,
      whatsappFormat: whatsappNumber,
      isValid: formattedNumber.length >= 10 && formattedNumber.length <= 15
    });
  } catch (error) {
    console.error('Error testing phone number:', error);
    res.status(500).json({ error: 'Failed to test phone number' });
  }
});

// Test delete endpoint - for debugging
app.get('/api/contact-requests/:id/test-delete', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await connectDB();
    
    console.log(`🧪 Testing delete for ID: ${id}`);
    
    // Check if document exists in any collection
    const results = {};
    
    const collections = ['contact_requests', 'contact-requests', 'contacts'];
    for (const collectionName of collections) {
      try {
        const doc = await database.collection(collectionName).findOne({ _id: parseId(id) });
        results[collectionName] = {
          exists: !!doc,
          document: doc ? { _id: doc._id, name: doc.name, email: doc.email } : null
        };
        
        // Also try with string ID
        if (!doc) {
          const docString = await database.collection(collectionName).findOne({ _id: id });
          results[collectionName + '_string'] = {
            exists: !!docString,
            document: docString ? { _id: docString._id, name: docString.name, email: docString.email } : null
          };
        }
      } catch (e) {
        results[collectionName] = { error: e.message };
      }
    }
    
    res.json({
      id: id,
      parsedId: parseId(id),
      results: results
    });
  } catch (error) {
    console.error('Error testing delete:', error);
    res.status(500).json({ error: 'Failed to test delete' });
  }
});

// === MESSAGES ENDPOINTS ===

// Get all messages (for admin dashboard)
app.get('/api/messages', async (req, res) => {
  try {
    const database = await connectDB();
    
    const messages = await database.collection('messages')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    
    res.json(messages);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get messages for a specific user
app.get('/api/messages/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const database = await connectDB();
    
    const messages = await database.collection('messages')
      .find({
        $or: [
          { senderId: userId },
          { recipientId: userId }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(messages);
  } catch (error) {
    console.error('❌ Error fetching user messages:', error);
    res.status(500).json({ error: 'Failed to fetch user messages' });
  }
});

// Send a message
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, recipientId, message, type = 'general' } = req.body;
    
    if (!senderId || !recipientId || !message) {
      return res.status(400).json({ error: 'Sender, recipient, and message are required' });
    }
    
    const database = await connectDB();
    
    const newMessage = {
      senderId,
      recipientId,
      message,
      type,
      status: 'unread',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await database.collection('messages').insertOne(newMessage);
    
    res.json({
      success: true,
      messageId: result.insertedId,
      message: newMessage
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
app.patch('/api/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await connectDB();
    
    const result = await database.collection('messages').updateOne(
      { _id: parseId(id) },
      { 
        $set: { 
          status: 'read',
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// === TICKET SYSTEM ENDPOINTS ===

// Get all tickets for a specific user
app.get('/api/tickets/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required',
        code: 'MISSING_EMAIL'
      });
    }

    console.log(`🎫 Fetching tickets for user: ${email}`);
    const database = await getDB();
    
    if (!database) {
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        code: 'DB_CONNECTION_ERROR'
      });
    }

    const tickets = await database.collection('tickets')
      .find({ userEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✅ Found ${tickets.length} tickets for ${email}`);

    return res.json({
      success: true,
      data: tickets,
      count: tickets.length,
      message: `Found ${tickets.length} tickets for ${email}`
    });
  } catch (error) {
    console.error('❌ Error fetching user tickets:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets',
      message: error.message,
      code: 'FETCH_ERROR'
    });
  }
});

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

// Create a new ticket (convert contact request to ticket)
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
    
    const updateResult = await database.collection('tickets').updateOne(
      { _id: parseId(id) },
      {
        $push: { responses: response },
        $set: { 
          status: 'in_progress',
          updatedAt: new Date(),
          lastResponseAt: new Date(),
          lastResponseBy: respondedBy || 'ICSRT Support'
        }
      }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }
    
    console.log(`✅ Response added to ticket ${id}`);
    
    res.json({
      success: true,
      data: response,
      message: 'Response added successfully'
    });
    
  } catch (error) {
    console.error('Error adding ticket response:', error);
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
    
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        validStatuses
      });
    }
    
    const updateResult = await database.collection('tickets').updateOne(
      { _id: parseId(id) },
      {
        $set: { 
          status,
          updatedAt: new Date(),
          updatedBy: updatedBy || 'System'
        }
      }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }
    
    console.log(`✅ Ticket ${id} status updated to ${status}`);
    
    res.json({
      success: true,
      message: `Ticket status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update ticket status',
      message: error.message 
    });
  }
});

// User reply to ticket
app.post('/api/tickets/:id/user-reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, userEmail, userName } = req.body;
    const database = await connectDB();
    
    console.log(`🎫 User reply to ticket: ${id}`);
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Reply message is required'
      });
    }

    // Get the ticket first to verify it exists and check status
    const ticket = await database.collection('tickets').findOne({ _id: parseId(id) });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if ticket is closed
    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot reply to a closed ticket. Please create a new ticket.',
        ticketStatus: ticket.status
      });
    }

    // Verify the user owns this ticket
    if (userEmail && ticket.userEmail && ticket.userEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'You can only reply to your own tickets'
      });
    }
    
    const userReply = {
      id: new ObjectId(),
      message: message.trim(),
      respondedBy: userName || ticket.userName || 'User',
      respondedAt: new Date(),
      type: 'user_reply',
      userEmail: userEmail || ticket.userEmail
    };
    
    const updateResult = await database.collection('tickets').updateOne(
      { _id: parseId(id) },
      {
        $push: { responses: userReply },
        $set: { 
          status: ticket.status === 'resolved' ? 'open' : ticket.status, // Reopen if was resolved
          updatedAt: new Date(),
          lastResponseAt: new Date(),
          lastResponseBy: userName || ticket.userName || 'User'
        }
      }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Failed to add reply'
      });
    }
    
    console.log(`✅ User reply added to ticket ${id}`);
    
    res.json({
      success: true,
      data: userReply,
      message: 'Reply added successfully',
      ticketStatus: ticket.status === 'resolved' ? 'open' : ticket.status
    });
    
  } catch (error) {
    console.error('Error adding user reply to ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add reply',
      message: error.message 
    });
  }
});

// Mark ticket as resolved (admin only)
app.patch('/api/tickets/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolvedBy, resolutionMessage } = req.body;
    const database = await connectDB();
    
    console.log(`🎫 Resolving ticket: ${id}`);
    
    const ticket = await database.collection('tickets').findOne({ _id: parseId(id) });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot resolve a closed ticket'
      });
    }

    const updateData = {
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: resolvedBy || 'ICSRT Support',
      updatedAt: new Date()
    };

    // Add resolution message if provided
    if (resolutionMessage && resolutionMessage.trim()) {
      const resolutionResponse = {
        id: new ObjectId(),
        message: resolutionMessage.trim(),
        respondedBy: resolvedBy || 'ICSRT Support',
        respondedAt: new Date(),
        type: 'resolution'
      };
      
      await database.collection('tickets').updateOne(
        { _id: parseId(id) },
        {
          $push: { responses: resolutionResponse },
          $set: updateData
        }
      );
    } else {
      await database.collection('tickets').updateOne(
        { _id: parseId(id) },
        { $set: updateData }
      );
    }
    
    console.log(`✅ Ticket ${id} marked as resolved`);
    
    res.json({
      success: true,
      message: 'Ticket marked as resolved',
      status: 'resolved'
    });
    
  } catch (error) {
    console.error('Error resolving ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to resolve ticket',
      message: error.message 
    });
  }
});

// Close ticket (admin only)
app.patch('/api/tickets/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const { closedBy, closeReason } = req.body;
    const database = await connectDB();
    
    console.log(`🎫 Closing ticket: ${id}`);
    
    const ticket = await database.collection('tickets').findOne({ _id: parseId(id) });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'Ticket is already closed'
      });
    }

    const updateData = {
      status: 'closed',
      closedAt: new Date(),
      closedBy: closedBy || 'ICSRT Support',
      closeReason: closeReason || 'Resolved and closed',
      updatedAt: new Date()
    };

    // Add close message if reason provided
    if (closeReason && closeReason.trim()) {
      const closeResponse = {
        id: new ObjectId(),
        message: `Ticket closed: ${closeReason.trim()}`,
        respondedBy: closedBy || 'ICSRT Support',
        respondedAt: new Date(),
        type: 'closure'
      };
      
      await database.collection('tickets').updateOne(
        { _id: parseId(id) },
        {
          $push: { responses: closeResponse },
          $set: updateData
        }
      );
    } else {
      await database.collection('tickets').updateOne(
        { _id: parseId(id) },
        { $set: updateData }
      );
    }
    
    console.log(`✅ Ticket ${id} closed`);
    
    res.json({
      success: true,
      message: 'Ticket closed successfully',
      status: 'closed'
    });
    
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to close ticket',
      message: error.message 
    });
  }
});

// Convert contact request to ticket
app.post('/api/contact-requests/:id/convert-to-ticket', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await connectDB();
    
    console.log(`🎫 Converting contact request ${id} to ticket`);
    
    // Find the contact request
    let contactRequest = null;
    let sourceCollection = '';
    
    // Try different collection names
    const collections = ['contact_requests', 'contact-requests', 'contacts'];
    for (const collectionName of collections) {
      contactRequest = await database.collection(collectionName).findOne({ _id: parseId(id) });
      if (contactRequest) {
        sourceCollection = collectionName;
        break;
      }
    }
    
    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        error: 'Contact request not found'
      });
    }
    
    // Check if already converted
    const existingTicket = await database.collection('tickets').findOne({ 
      sourceId: contactRequest._id.toString(),
      sourceType: 'contact_request'
    });
    
    if (existingTicket) {
      return res.json({
        success: true,
        data: existingTicket,
        message: `Contact request already converted to ticket ${existingTicket.ticketNumber}`
      });
    }
    
    // Generate ticket number
    const ticketCount = await database.collection('tickets').countDocuments();
    const ticketNumber = `ICSRT-${String(ticketCount + 1).padStart(6, '0')}`;
    
    // Create ticket from contact request
    const newTicket = {
      ticketNumber,
      subject: contactRequest.subject || 'Converted from Contact Request',
      message: contactRequest.message || '',
      category: contactRequest.category || 'general',
      priority: 'medium',
      status: 'open',
      userName: contactRequest.name || 'Anonymous',
      userEmail: contactRequest.email,
      userPhone: contactRequest.phone,
      createdAt: contactRequest.createdAt || contactRequest.timestamp || new Date(),
      updatedAt: new Date(),
      responses: [],
      tags: ['converted-from-contact'],
      assignedTo: null,
      sourceId: contactRequest._id.toString(),
      sourceType: 'contact_request',
      sourceCollection
    };
    
    const result = await database.collection('tickets').insertOne(newTicket);
    
    if (result.insertedId) {
      // Mark contact request as converted
      await database.collection(sourceCollection).updateOne(
        { _id: parseId(id) },
        { 
          $set: { 
            convertedToTicket: true,
            ticketId: result.insertedId.toString(),
            ticketNumber,
            convertedAt: new Date()
          }
        }
      );
      
      console.log(`✅ Contact request converted to ticket: ${ticketNumber}`);
      
      res.json({
        success: true,
        data: { ...newTicket, _id: result.insertedId },
        ticketNumber,
        message: `Contact request converted to ticket ${ticketNumber}`
      });
    } else {
      throw new Error('Failed to create ticket');
    }
    
  } catch (error) {
    console.error('Error converting contact to ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to convert to ticket',
      message: error.message 
    });
  }
});

// === ERROR HANDLING MIDDLEWARE ===

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
    
    // === SOCIAL MEDIA INITIALIZATION ===
    try {
      console.log('\n📱 Initializing Social Media Management System...');
      const database = await connectDB();
      const { SocialMediaService } = require('./social-media-service');
      const socialService = new SocialMediaService(database);
      await socialService.initializeDefaultData();
      console.log('✅ Social Media Management System ready');
    } catch (socialError) {
      console.log('⚠️  Social media initialization failed:', socialError.message);
      console.log('💡 Server will continue without social media defaults');
    }
    
    // === ENHANCED AUTO-START SYSTEM ===
    // Import auto-start functions
    const { createEnhancedTestData, autoStartFrontends } = require('./auto-start-system');
    
    // Create test data automatically
    try {
      console.log('\n🔧 Initializing Enhanced Test Data System...');
      await createEnhancedTestData(connectDB);
    } catch (testDataError) {
      console.log('⚠️  Enhanced test data creation failed:', testDataError.message);
      console.log('💡 Server will continue without demo data');
    }
    
    // Check email configuration on startup
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (emailUser && emailPass && emailUser !== 'your-email@gmail.com' && emailPass !== 'your-app-password-here') {
      // Test email configuration
      try {
        const transporter = createEmailTransporter();
        if (transporter) {
          await transporter.verify();
          console.log('✅ Email configuration verified successfully');
          console.log(`📧 Email service ready: ${emailUser}`);
        }
      } catch (error) {
        console.log('❌ Email configuration failed:', error.message);
        console.log('🔧 Email verification will use development mode (console logging)');
      }
    } else {
      console.log('⚠️  Email credentials not configured');
      console.log('📧 Email verification will use development mode (console logging)');
      console.log('🔧 To enable real email sending, run: node setup-email-wizard.js');
    }
    
    app.listen(port, () => {
      console.log(`🚀 ICSRT Backend Server running on port ${port}`);
      console.log(`� API Health: http://localhost:${port}/api/health`);
      
      // Auto-start frontend applications
      try {
        autoStartFrontends();
      } catch (autoStartError) {
        console.log('⚠️  Auto-start frontends failed:', autoStartError.message);
        console.log('💡 You can start them manually:');
        console.log('   � Dashboard: cd ../icsrt-dashboard && npm start');
        console.log('   👤 User Page: cd ../icsrt-userpage && npm start');
      }
      
      // Initialize WhatsApp service for automatic sending
      console.log('\n📱 WhatsApp Service Available');
      try {
        // await whatsappService.initialize(); // Disabled - initialize manually via dashboard
        console.log('💡 WhatsApp service ready for manual initialization');
        console.log('📱 Automatic sending available after initialization');
        console.log('🔧 To start: Go to Contact Messages → Click "Initialize" button');
      } catch (error) {
        console.log('⚠️ WhatsApp service initialization failed:', error.message);
        console.log('💡 Automatic sending will not work, but manual URL generation will still function');
        console.log('🔧 You can try to initialize manually via: POST /api/whatsapp-initialize');
      }
      
      console.log('\n📝 Available endpoints:');
      console.log('   === Authentication & User Management ===');
      console.log('   - POST /api/auth/signup (User registration with email verification)');
      console.log('   - POST /api/auth/login (Login - requires verified email)');
      console.log('   - POST /api/auth/change-password (Change user password)');
      console.log('   - POST /api/auth/verify-email (Verify email with code)');
      console.log('   - GET  /api/auth/verify-email/:token (Verify email with link)');
      console.log('   - POST /api/auth/resend-verification (Resend verification email)');
      console.log('   - GET|POST|PUT|DELETE /api/users (User CRUD for dashboard)');
      console.log('   === WhatsApp Integration ===');
      console.log('   - GET  /api/whatsapp-status (Check WhatsApp service status)');
      console.log('   - POST /api/whatsapp-initialize (Initialize WhatsApp service)');
      console.log('   - POST /api/whatsapp-stop (Stop WhatsApp service)');
      console.log('   - GET|POST /api/whatsapp-config (WhatsApp configuration)');
      console.log('   - GET  /api/whatsapp-notifications (WhatsApp notifications)');
      console.log('   === General Statistics ===');
      console.log('   - GET  /api/dashboard-stats (Admin dashboard statistics)');
      console.log('   - GET  /api/user-stats (User dashboard statistics)');
      console.log('   - GET  /api/user/registrations (User registrations)');
      console.log('   === Messages & Communication ===');
      console.log('   - GET  /api/messages (All messages for admin)');
      console.log('   - GET  /api/messages/user/:userId (User-specific messages)');
      console.log('   - POST /api/messages (Send a message)');
      console.log('   - PATCH /api/messages/:id/read (Mark message as read)');
      console.log('   === Support Tickets ===');
      console.log('   - GET  /api/tickets (All tickets for admin)');
      console.log('   - GET  /api/tickets/user/:email (User-specific tickets)');
      console.log('   - POST /api/tickets (Create new ticket)');
      console.log('   - GET  /api/tickets/:id (Get ticket details)');
      console.log('   - POST /api/tickets/:id/respond (Admin respond to ticket)');
      console.log('   - PATCH /api/tickets/:id/status (Update ticket status)');
      console.log('   === Service Orders ===');
      console.log('   - Enhanced service order endpoints via external API module');
      console.log('   === Auto-generated CRUD ===');
      console.log('   - Auto-generated CRUD for:', collections.join(', '));
      
      // Email status message
      if (emailUser && emailPass && emailUser !== 'your-email@gmail.com' && emailPass !== 'your-app-password-here') {
        console.log('   📧 Email verification: CONFIGURED & READY ✅');
      } else {
        console.log('   📧 Email verification: DEVELOPMENT MODE (console logging)');
        console.log('   🔧 To enable real emails: node setup-email-wizard.js');
      }
    });
  } catch (error) {
    console.log('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Email sending functions
async function sendEmail(email, subject, htmlContent) {
  try {
    const transporter = createEmailTransporter();
    
    if (!transporter) {
      console.log('\n🚨 EMAIL NOT CONFIGURED - Development Mode 🚨');
      console.log(`📧 To: ${email}`);
      console.log(`📝 Subject: ${subject}`);
      console.log(`📄 Content: ${htmlContent.substring(0, 100)}...`);
      console.log('═══════════════════════════════════════════════\n');
      return { success: true, message: 'Email logged in development mode' };
    }

    const mailOptions = {
      from: `ICSRT System <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${email}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    throw error;
  }
}

async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to ICSRT Newsletter!';
  const content = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px;">ICSRT</h1>
        <p style="margin: 10px 0 0; font-size: 18px;">International Conference on Science, Research and Technology</p>
      </div>
      <div style="padding: 30px; background-color: #f8f9fa;">
        <h2 style="color: #3B82F6;">Welcome${name ? ', ' + name : ''}!</h2>
        <p>Thank you for subscribing to our newsletter. You'll now receive updates about:</p>
        <ul style="color: #666;">
          <li>New research services and offerings</li>
          <li>Latest articles and publications</li>
          <li>Conference announcements and events</li>
          <li>Research opportunities and collaborations</li>
        </ul>
        <p>We're excited to keep you informed about the latest developments in science, research, and technology!</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${getFrontendUrl()}" 
             style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Visit ICSRT Website
          </a>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; color: #666; font-size: 14px;">
        <p>If you no longer wish to receive these emails, you can 
           <a href="${getApiUrl()}/unsubscribe?email=${email}" style="color: #3B82F6;">unsubscribe here</a>
        </p>
      </div>
    </div>
  `;
  
  return sendEmail(email, subject, content);
}

async function sendNewsletterEmail(email, name, subject, content, type) {
  const wrappedContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">ICSRT Newsletter</h1>
        <p style="margin: 5px 0 0; font-size: 14px;">${new Date().toLocaleDateString()}</p>
      </div>
      <div style="padding: 30px; background-color: white;">
        ${name ? `<p style="color: #666;">Hello ${name},</p>` : ''}
        ${content}
      </div>
      <div style="padding: 20px; text-align: center; color: #666; font-size: 14px; background-color: #f8f9fa;">
        <p>If you no longer wish to receive these emails, you can 
           <a href="${getApiUrl()}/unsubscribe?email=${email}" style="color: #3B82F6;">unsubscribe here</a>
        </p>
        <p style="margin-top: 10px;">© 2025 ICSRT. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail(email, subject, wrappedContent);
}

// Auto-send newsletter when new service or article is created
async function notifySubscribersOfNewContent(type, title, description, link) {
  try {
    const database = await connectDB();
    const newsletterCollection = database.collection('newsletter_subscribers');
    
    // Get active subscribers who want this type of content
    const preference = type === 'service' ? 'services' : type === 'article' ? 'articles' : 'events';
    const subscribers = await newsletterCollection.find({ 
      status: 'active',
      preferences: preference
    }).toArray();
    
    if (subscribers.length === 0) {
      console.log(`No subscribers found for ${preference} notifications`);
      return;
    }
    
    const subject = type === 'service' 
      ? `🚀 New Service Available: ${title}`
      : type === 'article' 
      ? `📚 New Article Published: ${title}`
      : `📅 New Event: ${title}`;
    
    const content = `
      <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">
          ${type === 'service' ? '🚀 New Service Available!' : type === 'article' ? '📚 New Article Published!' : '📅 New Event Announced!'}
        </h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">${title}</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0;">
          ${description}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link || getFrontendUrl()}" 
             style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            ${type === 'service' ? 'View Service Details' : type === 'article' ? 'Read Full Article' : 'View Event Details'}
          </a>
        </div>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          💡 <strong>Stay Updated:</strong> Visit our website regularly for more ${type === 'service' ? 'services' : type === 'article' ? 'articles' : 'events'} and research opportunities.
        </p>
      </div>
    `;
    
    // Send emails to all relevant subscribers
    let successCount = 0;
    let failCount = 0;
    
    for (const subscriber of subscribers) {
      try {
        await sendNewsletterEmail(subscriber.email, subscriber.name, subject, content, type);
        successCount++;
        
        // Update email sent count
        await newsletterCollection.updateOne(
          { _id: subscriber._id },
          { 
            $inc: { emailsSent: 1 },
            $set: { lastEmailSent: new Date() }
          }
        );
      } catch (emailError) {
        console.warn(`Failed to send ${type} notification to ${subscriber.email}:`, emailError.message);
        failCount++;
      }
    }
    
    // Log the notification
    await database.collection('newsletter_campaigns').insertOne({
      subject,
      content,
      type: `auto_${type}`,
      targetPreference: preference,
      totalSubscribers: subscribers.length,
      successCount,
      failCount,
      sentAt: new Date(),
      contentTitle: title,
      automated: true
    });
    
    console.log(`📧 ${type.toUpperCase()} notification sent: ${successCount} success, ${failCount} failed`);
    
  } catch (error) {
    console.error(`Error sending ${type} notifications:`, error);
  }
}

// === USER PHONE LOOKUP ENDPOINT ===

// Get user phone number by email (for WhatsApp replies)
app.get('/api/users/phone/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    console.log(`🔍 Phone lookup request for: ${email}`);
    const database = await connectDB();
    
    const user = await database.collection('users').findOne(
      { email: email.toLowerCase() },
      { projection: { phone: 1, fullName: 1, email: 1, createdAt: 1 } }
    );

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    console.log(`📱 User found: ${user.fullName} - Phone: ${user.phone || 'Not available'}`);

    if (!user.phone) {
      console.log(`⚠️ User ${email} has no phone number in database`);
    }

    res.json({
      success: true,
      user: {
        phone: user.phone,
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ User phone lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lookup user phone',
      code: 'LOOKUP_ERROR'
    });
  }
});

// === USER PROFILE ENDPOINTS (for user page) ===

// Update user profile (for user page)
app.put('/api/user/profile', async (req, res) => {
  try {
    const database = await connectDB();
    const { email, fullName, phone, institution, bio, currentEmail } = req.body;
    
    if (!currentEmail) {
      return res.status(400).json({
        success: false,
        error: 'Current email is required',
        code: 'MISSING_CURRENT_EMAIL'
      });
    }

    // Find user by current email
    const user = await database.collection('users').findOne({
      email: currentEmail.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (fullName) updateData.fullName = fullName.trim();
    if (email && email !== currentEmail) updateData.email = email.toLowerCase().trim();
    if (institution) updateData.institution = institution.trim();
    if (bio) updateData.bio = bio.trim();
    
    // Handle phone number with proper formatting
    if (phone) {
      // If phone includes country code selection (like from the screenshot)
      let formattedPhone = phone.trim();
      
      // If phone doesn't start with + but we have a country code, add it
      if (!formattedPhone.startsWith('+')) {
        // Default to Egypt +20 if no country code (as seen in screenshot)
        formattedPhone = '+20' + formattedPhone;
      }
      
      updateData.phone = formattedPhone;
      console.log(`📱 Updating phone for ${currentEmail}: ${formattedPhone}`);
    }

    // Update user
    const result = await database.collection('users').updateOne(
      { _id: user._id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Failed to update profile',
        code: 'UPDATE_FAILED'
      });
    }

    // Return updated user info
    const updatedUser = await database.collection('users').findOne(
      { _id: user._id },
      { projection: { password: 0, verificationCode: 0, verificationToken: 0 } }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      code: 'PROFILE_UPDATE_ERROR'
    });
  }
});

// Get user profile (for user page)
app.get('/api/user/profile/:email', async (req, res) => {
  try {
    const database = await connectDB();
    const { email } = req.params;

    const user = await database.collection('users').findOne(
      { email: email.toLowerCase() },
      { projection: { password: 0, verificationCode: 0, verificationToken: 0 } }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
      code: 'GET_PROFILE_ERROR'
    });
  }
});

// Import articles module
const { articlesAPI } = require('./research-articles-module');

// Import social media service
const { SocialMediaService } = require('./social-media-service');

// === RESEARCH ARTICLES API ===
// Add research articles endpoints for homepage and userpage

// GET all articles with filtering
app.get('/api/articles', articlesAPI.getAll);

// GET featured articles for homepage  
app.get('/api/articles/featured', articlesAPI.getFeatured);

// GET single article by ID
app.get('/api/articles/:id', articlesAPI.getById);

// === SOCIAL MEDIA MANAGEMENT API ===
// Fresh social media management system

// GET all social media links
app.get('/api/social-links', async (req, res) => {
  try {
    console.log('📱 GET /api/social-links - Fetching all social media links');
    const database = await connectDB();
    const socialService = new SocialMediaService(database);
    
    const result = await socialService.getAllLinks();
    res.json(result);
  } catch (error) {
    console.error('❌ GET social links error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social media links',
      code: 'FETCH_ERROR'
    });
  }
});

// GET enabled social media links only (for user page footer)
app.get('/api/social-links/enabled', async (req, res) => {
  try {
    console.log('📱 GET /api/social-links/enabled - Fetching enabled social media links');
    const database = await connectDB();
    const socialService = new SocialMediaService(database);

    const result = await socialService.getEnabledLinks();
    res.json(result);
  } catch (error) {
    console.error('❌ GET enabled social links error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enabled social media links',
      code: 'FETCH_ERROR'
    });
  }
});

// GET single social media link
app.get('/api/social-links/:id', async (req, res) => {
  try {
    console.log(`📱 GET /api/social-links/${req.params.id} - Fetching single social media link`);
    const database = await connectDB();
    const socialService = new SocialMediaService(database);
    
    const result = await socialService.getLinkById(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ GET single social link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social media link',
      code: 'FETCH_ERROR'
    });
  }
});

// CREATE new social media link
app.post('/api/social-links', async (req, res) => {
  try {
    console.log('📱 POST /api/social-links - Creating new social media link');
    const database = await connectDB();
    const socialService = new SocialMediaService(database);
    
    const result = await socialService.createLink(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ POST social link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create social media link',
      code: 'CREATE_ERROR'
    });
  }
});

// UPDATE social media link
app.put('/api/social-links/:id', async (req, res) => {
  try {
    console.log(`📱 PUT /api/social-links/${req.params.id} - Updating social media link`);
    const database = await connectDB();
    const socialService = new SocialMediaService(database);
    
    const result = await socialService.updateLink(req.params.id, req.body);
    
    if (!result.success) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      return res.status(status).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ PUT social link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update social media link',
      code: 'UPDATE_ERROR'
    });
  }
});

// DELETE social media link
app.delete('/api/social-links/:id', async (req, res) => {
  try {
    console.log(`📱 DELETE /api/social-links/${req.params.id} - Deleting social media link`);
    const database = await connectDB();
    const socialService = new SocialMediaService(database);
    
    const result = await socialService.deleteLink(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ DELETE social link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete social media link',
      code: 'DELETE_ERROR'
    });
  }
});

// REORDER social media links
app.put('/api/social-links/reorder', async (req, res) => {
  try {
    console.log('📱 PUT /api/social-links/reorder - Reordering social media links');
    const database = await connectDB();
    const socialService = new SocialMediaService(database);
    
    const result = await socialService.reorderLinks(req.body.links);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ Reorder social links error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder social media links',
      code: 'REORDER_ERROR'
    });
  }
});

console.log('✅ Social Media Management API endpoints initialized');

// === END WORKING SOCIAL LINKS OVERRIDE ===

// === CONTACT MESSAGES MANAGEMENT ENDPOINTS ===

// Handle preflight requests for contact endpoints
app.options('/api/contacts', cors(corsOptions));
app.options('/api/contact-requests', cors(corsOptions));

// NOTE: Using /api/contact-requests instead of /api/contacts for dashboard
// The /api/contacts endpoint is commented out to avoid confusion

/*
// Get all contact messages - SIMPLIFIED VERSION THAT WORKS
app.get('/api/contacts', async (req, res) => {
  console.log('📞 Contact API called at:', new Date().toISOString());
  
  try {
    const database = await connectDB();
    if (!database) {
      throw new Error('Database not connected');
    }
    
    // Try to get contacts from contact_requests first (underscore)
    let contacts = await database.collection('contact_requests').find({}).sort({ createdAt: -1 }).toArray();
    
    // If no data, try contact-requests (hyphen)
    if (contacts.length === 0) {
      contacts = await database.collection('contact-requests').find({}).sort({ createdAt: -1 }).toArray();
    }
    
    // If still no data, try just 'contacts'
    if (contacts.length === 0) {
      contacts = await database.collection('contacts').find({}).sort({ createdAt: -1 }).toArray();
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
*/

// Create new contact message (from user page)
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, subject, and message are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }
    
    const database = await connectDB();
    
    const newContact = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      subject: subject.trim(),
      message: message.trim(),
      read: false,
      replied: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ipAddress: req.ip || 'unknown'
    };
    
    const result = await database.collection('contact_requests').insertOne(newContact);
    
    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully',
      data: { ...newContact, _id: result.insertedId }
    });
  } catch (error) {
    console.error('❌ Create contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send contact message',
      code: 'CREATE_ERROR'
    });
  }
});

// Mark contact as read
app.put('/api/contacts/:id/read', async (req, res) => {
  try {
    const database = await connectDB();
    const result = await database.collection('contact_requests').updateOne(
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
        error: 'Contact message not found',
        code: 'NOT_FOUND'
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
      error: 'Failed to mark contact as read',
      code: 'UPDATE_ERROR'
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
        error: 'Reply message is required',
        code: 'MISSING_REPLY_MESSAGE'
      });
    }
    
    const database = await connectDB();
    
    // Get the original contact message
    const contact = await database.collection('contact_requests').findOne({ 
      _id: parseId(req.params.id) 
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found',
        code: 'NOT_FOUND'
      });
    }
    
    // Here you would typically send an email using nodemailer or similar
    // For now, we'll just mark it as replied and store the reply
    
    const updateResult = await database.collection('contact_requests').updateOne(
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
        error: 'Contact message not found',
        code: 'NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: {
        contactId: req.params.id,
        replyMessage: replyMessage.trim(),
        replyDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Reply to contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send reply',
      code: 'REPLY_ERROR'
    });
  }
});

// Delete contact message
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const database = await connectDB();
    const result = await database.collection('contact_requests').deleteOne({ 
      _id: parseId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found',
        code: 'NOT_FOUND'
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
      error: 'Failed to delete contact message',
      code: 'DELETE_ERROR'
    });
  }
});

// Handle 404 (must be after all routes)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Global error handler (last middleware)
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
  });
});

// Start server (MUST be last)
startServer();
