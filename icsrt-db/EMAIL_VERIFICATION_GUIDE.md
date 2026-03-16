# ICSRT Email Verification System

## 🎯 Overview
The ICSRT backend now includes a comprehensive email verification system for user signup. This system removes registration-specific fields and implements secure email verification using Nodemailer.

## 🔧 Setup Instructions

### 1. Email Configuration
Copy `.env.example` to `.env` and configure your email settings:

```bash
cp .env.example .env
```

Edit `.env` with your email credentials:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings > Security > App Passwords
3. Generate a new app password for "Mail"
4. Use this app password (not your regular password) in `EMAIL_PASS`

### 3. Alternative Email Providers
The system supports other providers. Update the `createEmailTransporter()` function in `server.js`:

**Yahoo Mail:**
```javascript
service: 'yahoo'
```

**Outlook/Hotmail:**
```javascript
service: 'outlook'
```

**Custom SMTP:**
```javascript
host: 'smtp.your-provider.com',
port: 587,
secure: false
```

## 📋 API Endpoints

### User Registration
**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com", 
  "password": "securepassword",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification instructions.",
  "userId": "user_id_here",
  "emailSent": true,
  "data": {
    "_id": "user_id_here",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isVerified": false,
    "status": "pending"
  }
}
```

### Email Verification (Code)
**POST** `/api/auth/verify-email`

**Request Body:**
```json
{
  "email": "john@example.com",
  "verificationCode": "A1B2C3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in.",
  "user": {
    "_id": "user_id_here",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isVerified": true,
    "status": "active"
  }
}
```

### Email Verification (Link)
**GET** `/api/auth/verify-email/:token`

Users can click the verification link in their email to verify automatically.

### Resend Verification
**POST** `/api/auth/resend-verification`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### User Login (Enhanced)
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id_here",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isVerified": true,
    "status": "active"
  },
  "token": "verified-user-token"
}
```

**Unverified User Response:**
```json
{
  "success": false,
  "error": "Please verify your email address before logging in",
  "code": "EMAIL_NOT_VERIFIED",
  "needsVerification": true,
  "email": "john@example.com"
}
```

## 🗃️ Database Changes

### User Schema Updates
Users now have these additional fields:
- `isVerified`: Boolean indicating email verification status
- `verificationCode`: 6-character hex code (hidden from API responses)
- `verificationToken`: Secure token for email links (hidden from API responses)
- `verificationExpires`: Expiration date for verification (24 hours)
- `verifiedAt`: Timestamp when email was verified
- `lastLoginAt`: Timestamp of last successful login

### Registration Fields Removed
The following registration-specific fields are now ignored during signup:
- `registrationType`
- `university`
- `fieldOfStudy`
- `academicLevel`
- `conferenceId`
- Any other registration-specific data

## 🔒 Security Features

### 1. Email Verification Required
- Users cannot log in until their email is verified
- Verification codes expire after 24 hours
- Verification tokens are cryptographically secure

### 2. Data Sanitization
- Sensitive verification data is never exposed via API
- Password storage (implement hashing in production)
- Input validation for all endpoints

### 3. Rate Limiting (Recommended)
Consider implementing rate limiting for:
- Signup attempts
- Verification attempts  
- Resend verification requests

## 📧 Email Template

The verification email includes:
- Welcome message with user's name
- 6-character verification code
- One-click verification link
- 24-hour expiration notice
- Professional ICSRT branding

## 🚀 Testing

### Test the Signup Process
```bash
# 1. Register new user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123","phone":"1234567890"}'

# 2. Try to login (should fail)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Verify email (replace with actual code from email)
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","verificationCode":"A1B2C3"}'

# 4. Login successfully
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🛠️ Production Recommendations

### 1. Password Security
```javascript
// Install bcrypt
npm install bcrypt

// Hash passwords before storing
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 12);

// Compare during login
const isValid = await bcrypt.compare(password, user.password);
```

### 2. Environment Variables
```env
NODE_ENV=production
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_secure_app_password
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_production_mongodb_uri
```

### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 signups per window
  message: 'Too many signup attempts, please try again later.'
});

app.use('/api/auth/signup', signupLimiter);
```

### 4. HTTPS Only
Ensure all authentication endpoints use HTTPS in production.

## 📊 Monitoring

Monitor these metrics:
- Signup success rate
- Email delivery rate  
- Verification completion rate
- Failed login attempts

## 🔄 Migration from Old System

Existing users without verification:
1. Mark existing users as verified: `isVerified: true`
2. Or force re-verification on next login
3. Clean up old registration-specific fields

## 🤝 Support

For issues with email verification:
1. Check email provider settings
2. Verify environment variables
3. Check spam folders
4. Use resend verification endpoint
5. Check server logs for email sending errors

---

**✅ Status: Implementation Complete**
- ✅ Registration fields removed
- ✅ Email verification implemented  
- ✅ Login restrictions added
- ✅ Secure verification codes
- ✅ Professional email templates
- ✅ Comprehensive API documentation
