# Hostinger Deployment Guide for ICSRT

## Overview
This application has been updated to automatically detect production environment and use the correct domains for Hostinger deployment.

## Domain Configuration

### Production Domains
- **User Page**: `https://icsrt.cloud`
- **Admin Dashboard**: `https://admin.icsrt.cloud`
- **API Server**: `https://api.icsrt.cloud`

### Development (localhost)
- **User Page**: `http://localhost:3002`
- **Admin Dashboard**: `http://localhost:3000`
- **API Server**: `http://localhost:3000`

## Changes Made

### 1. Frontend API Configuration
**Files Updated:**
- `icsrt-dashboard/src/lib/api.js`
- `icsrt-userpage/src/lib/api.js`

**How it works:**
- The API automatically detects the hostname
- If on `icsrt.cloud` → uses `https://api.icsrt.cloud`
- If on `admin.icsrt.cloud` → uses `https://api.icsrt.cloud`
- If on `localhost` → uses `http://localhost:3000`

### 2. Backend Server Configuration
**File Updated:**
- `icsrt-db/server.js`

**Changes:**
- Added helper functions: `getFrontendUrl()` and `getApiUrl()`
- Updated CORS to allow production domains
- All email notifications now use correct production URLs
- Environment detection based on `NODE_ENV` variable

## Environment Variables

### For Production Deployment
Set these environment variables on Hostinger:

```bash
# Required
NODE_ENV=production
PORT=3000

# API URLs (optional - will auto-detect)
API_URL=https://api.icsrt.cloud
FRONTEND_URL=https://icsrt.cloud

# CORS Origins (comma-separated)
CORS_ORIGINS=https://icsrt.cloud,https://admin.icsrt.cloud
# OR
ALLOWED_ORIGINS=https://icsrt.cloud,https://admin.icsrt.cloud

# Database
MONGODB_URI=your_mongodb_connection_string

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# JWT Secret
JWT_SECRET=your_secure_jwt_secret

# Admin API Token (for production)
ADMIN_API_TOKEN=your_secure_admin_token
```

### For Local Development
Create `.env` file in `icsrt-db/`:

```bash
NODE_ENV=development
PORT=3000

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/icsrt_db

# Email (optional for development)
EMAIL_USER=
EMAIL_PASS=

# JWT Secret (development)
JWT_SECRET=icsrt-dashboard-secret-key-2024
```

## Hostinger Deployment Steps

### 1. Build Frontend Applications

**IMPORTANT**: Create environment files BEFORE building!

```bash
# Build User Page
cd icsrt-userpage
echo "REACT_APP_API_BASE_URL=https://api.icsrt.cloud" > .env.production
npm install
npm run build

# Build Dashboard
cd ../icsrt-dashboard
echo "REACT_APP_API_BASE_URL=https://api.icsrt.cloud" > .env.production
npm install
npm run build
```

### 2. Upload Files to Hostinger

Upload the following to your Hostinger server:

**For User Page:**
- **Domain**: `https://icsrt.cloud`
- **Files**: Upload all contents of `icsrt-userpage/build` folder
- **Location**: Main domain's public_html directory
- **DNS**: Point `icsrt.cloud` to this directory in Hostinger

**For Admin Dashboard:**
- **Domain**: `https://admin.icsrt.cloud`
- **Files**: Upload all contents of `icsrt-dashboard/build` folder
- **Location**: Subdomain's public_html directory (admin.icsrt.cloud)
- **DNS**: Point `admin.icsrt.cloud` subdomain to this directory in Hostinger

### 3. Backend Deployment (API Server)

Upload backend to `https://api.icsrt.cloud`:

1. Upload all files from `icsrt-db/` (except `node_modules`)
2. SSH into your server
3. Run:
   ```bash
   cd /path/to/api
   npm install --production
   ```
4. Create `.env` file with these EXACT variables:
   ```bash
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   API_URL=https://api.icsrt.cloud
   FRONTEND_URL=https://icsrt.cloud
   CORS_ORIGINS=https://icsrt.cloud,https://admin.icsrt.cloud
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   JWT_SECRET=your_secure_jwt_secret
   ADMIN_API_TOKEN=your_secure_admin_token
   ```
5. Start server:
   ```bash
   pm2 start server.js --name icsrt-api
   ```

**IMPORTANT**: The API URL must be set to `https://api.icsrt.cloud` in the `.env` file.

### 4. MongoDB Setup

Host your MongoDB on:
- MongoDB Atlas (cloud)
- Or install MongoDB on your Hostinger server

Update `MONGODB_URI` in your `.env` file.

### 5. SSL Certificates

Ensure SSL certificates are installed for:
- `icsrt.cloud`
- `admin.icsrt.cloud`
- `api.icsrt.cloud`

## How Detection Works

### Frontend Detection
```javascript
// Automatically detects:
if (hostname === 'icsrt.cloud' || hostname === 'admin.icsrt.cloud') {
  // Use production API
  API_URL = 'https://api.icsrt.cloud'
} else {
  // Use localhost for development
  API_URL = 'http://localhost:3000'
}
```

### Backend Detection
```javascript
// Checks NODE_ENV environment variable
if (process.env.NODE_ENV === 'production') {
  // Use production domains
  FRONTEND_URL = 'https://icsrt.cloud'
  API_URL = 'https://api.icsrt.cloud'
} else {
  // Use localhost for development
  FRONTEND_URL = 'http://localhost:3002'
  API_URL = 'http://localhost:3000'
}
```

## Testing

### Test Locally
```bash
# Start all servers locally
npm run start

# Or use the batch files
.\start-backend-server.bat
.\start-dashboard.bat
.\start-userpage.bat
```

### Test in Production

**User Page** (`https://icsrt.cloud`):
1. Visit `https://icsrt.cloud`
2. Should load and work normally
3. Check browser console - no CORS errors
4. Check API requests - should go to `https://api.icsrt.cloud`
5. Try logging in

**Admin Dashboard** (`https://admin.icsrt.cloud`):
1. Visit `https://admin.icsrt.cloud`
2. Should load and work normally
3. Check browser console - no CORS errors
4. Check API requests - should go to `https://api.icsrt.cloud`
5. Try logging in as admin

## Troubleshooting

### CORS Errors
- Ensure production domains are in CORS_ORIGINS environment variable
- Check that all domains use HTTPS
- Verify SSL certificates are valid

### API Not Found
- Check `NODE_ENV` is set to `production`
- Verify API server is running on port 3000
- Check firewall allows connections to API port

### Environment Variables Not Working
- Ensure `.env` file is in the correct location
- Restart the server after changing `.env`
- Check that variables don't have extra spaces

## Notes

- The system automatically falls back to localhost in development
- No code changes needed when switching between environments
- Environment variables always take precedence
- Production mode requires valid SSL certificates for all domains
