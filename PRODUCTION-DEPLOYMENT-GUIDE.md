# 🚀 Production Deployment Guide - ICSRT++

## Complete Checklist for Deploying to Production

This guide ensures **zero issues** when deploying your ICSRT++ system to production.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables Configuration](#environment-variables-configuration)
3. [CORS Configuration](#cors-configuration)
4. [Email Configuration](#email-configuration)
5. [Database Configuration](#database-configuration)
6. [Security Hardening](#security-hardening)
7. [Deployment Steps](#deployment-steps)
8. [Post-Deployment Testing](#post-deployment-testing)
9. [Troubleshooting](#troubleshooting)

---

## 🔍 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ **Production domains ready**:
  - User-facing website: `https://icsrt.cloud`
  - Admin dashboard: `https://admin.icsrt.cloud`
  - Backend API: `https://api.icsrt.cloud`

- ✅ **SSL certificates installed** for all domains (HTTPS enabled)

- ✅ **MongoDB Atlas account** (or production MongoDB server)

- ✅ **Gmail account with 2FA** for email sending

- ✅ **Server access** (SSH, cPanel, or hosting control panel)

---

## 🔧 Environment Variables Configuration

### Production Environment Variables

Create or update `.env` file on your production server with these values:

```bash
# ========================================
# PRODUCTION ENVIRONMENT VARIABLES
# ========================================

# Environment
NODE_ENV=production
PORT=3000

# API URLs (UPDATE THESE!)
API_URL=https://api.icsrt.cloud
FRONTEND_URL=https://icsrt.cloud

# CORS Configuration (CRITICAL!)
CORS_ORIGINS=https://icsrt.cloud,https://admin.icsrt.cloud,https://api.icsrt.cloud

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/icsrt_main?retryWrites=true&w=majority

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secure-random-secret-key-here-change-this-123456

# ========================================
# Email Configuration (REQUIRED!)
# ========================================
# See EMAIL-SETUP-PRODUCTION.md for detailed setup
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password

# ========================================
# Paymob Configuration (If using payment)
# ========================================
PAYMOB_API_KEY=your_production_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret
```

---

## 🌐 CORS Configuration

### What is CORS?

CORS (Cross-Origin Resource Sharing) controls which domains can access your API. **This is critical for security and functionality.**

### Why CORS Errors Happen

When your frontend (e.g., `https://icsrt.cloud`) tries to access your backend API (e.g., `https://api.icsrt.cloud`), the browser blocks the request unless CORS is properly configured.

### Fixed in Current Version ✅

The CORS configuration has been updated to support both development and production:

```javascript
// server.js already includes:
const productionOrigins = [
  'https://admin.icsrt.cloud',
  'https://icsrt.cloud',
  'https://api.icsrt.cloud'
];

const devOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:5173'
];
```

### Configuration Steps

#### Option 1: Using Environment Variable (Recommended)

Set `CORS_ORIGINS` in your `.env` file:

```bash
# Production
CORS_ORIGINS=https://icsrt.cloud,https://admin.icsrt.cloud,https://api.icsrt.cloud

# Development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

#### Option 2: Hardcoded (Fallback)

The server will automatically use the hardcoded origins if `CORS_ORIGINS` is not set.

### Verifying CORS Configuration

After deployment, check browser console:

**❌ CORS Error (Not Configured):**
```
Access to fetch at 'https://api.icsrt.cloud/api/...' from origin 'https://icsrt.cloud' 
has been blocked by CORS policy
```

**✅ CORS Working (Configured Correctly):**
```
Network requests successful, no CORS errors in console
```

---

## 📧 Email Configuration

### Quick Setup

1. **Enable 2FA on Gmail:**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to `.env`:**
   ```bash
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```

4. **Restart server**

📖 **Detailed Guide:** See `EMAIL-SETUP-PRODUCTION.md`

### Testing Email Configuration

After setup, test by:
1. Registering a new user
2. Check if verification email arrives
3. Check server logs for "📧 Email configured" message

---

## 🗄️ Database Configuration

### MongoDB Atlas (Recommended)

1. **Create Cluster:**
   - Go to: https://cloud.mongodb.com
   - Create a free/paid cluster

2. **Whitelist IP:**
   - Go to Network Access
   - Add your server's IP address
   - Or add `0.0.0.0/0` (allow from anywhere - less secure)

3. **Create Database User:**
   - Go to Database Access
   - Create user with read/write permissions
   - Copy username and password

4. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `icsrt_main`

5. **Add to `.env`:**
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/icsrt_main?retryWrites=true&w=majority
   ```

### Local MongoDB (Alternative)

If using local MongoDB:
```bash
MONGODB_URI=mongodb://localhost:27017/icsrt_main
```

---

## 🔒 Security Hardening

### 1. Change JWT Secret

**Never use the default secret in production!**

```bash
# Generate a strong random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env
JWT_SECRET=your-generated-secret-here
```

### 2. Enable HTTPS

- Install SSL certificate (Let's Encrypt, Cloudflare, or hosting provider)
- Redirect all HTTP traffic to HTTPS
- Update all URLs in `.env` to use `https://`

### 3. Environment Variables Security

**Never commit `.env` file to Git!**

Verify `.gitignore` includes:
```
.env
.env.local
.env.production
```

### 4. Rate Limiting

Already configured in `server.js`:
```javascript
const globalLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
```

Adjust as needed for your traffic.

### 5. Database Security

- ✅ Use strong passwords
- ✅ Whitelist only necessary IPs
- ✅ Enable MongoDB authentication
- ✅ Use connection encryption (SSL/TLS)

---

## 🚀 Deployment Steps

### Option A: cPanel/Hostinger Deployment

1. **Upload Files:**
   ```bash
   # Upload these folders via FTP/File Manager:
   - icsrt-db/        (Backend API)
   - icsrt-dashboard/ (Admin Dashboard)
   - icsrt-userpage/  (User Website)
   ```

2. **Install Dependencies:**
   ```bash
   # SSH into server or use terminal in cPanel
   cd icsrt-db
   npm install --production
   
   cd ../icsrt-dashboard
   npm install --production
   npm run build
   
   cd ../icsrt-userpage
   npm install --production
   npm run build
   ```

3. **Configure Environment Variables:**
   - In cPanel: Go to "Environment Variables" or "Node.js App"
   - Add all variables from `.env` file
   - Or create `.env` file in `icsrt-db/` folder

4. **Setup Node.js App:**
   - In cPanel: Go to "Setup Node.js App"
   - Select Node version: 18.x or higher
   - Application root: `/home/username/icsrt-db`
   - Application startup file: `server.js`
   - Click "Create"

5. **Configure Apache/Nginx:**
   - Point `api.icsrt.cloud` to `icsrt-db` folder
   - Point `admin.icsrt.cloud` to `icsrt-dashboard/build` folder
   - Point `icsrt.cloud` to `icsrt-userpage/build` folder

### Option B: VPS/Cloud Server Deployment

1. **Connect to Server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone/Upload Project:**
   ```bash
   cd /var/www
   git clone your-repo-url icsrt
   cd icsrt
   ```

4. **Install Dependencies:**
   ```bash
   cd icsrt-db
   npm install --production
   
   cd ../icsrt-dashboard
   npm install --production
   npm run build
   
   cd ../icsrt-userpage
   npm install --production
   npm run build
   ```

5. **Create `.env` File:**
   ```bash
   cd /var/www/icsrt/icsrt-db
   nano .env
   # Paste production environment variables
   # Save: Ctrl+X, then Y, then Enter
   ```

6. **Install PM2 (Process Manager):**
   ```bash
   sudo npm install -g pm2
   
   # Start backend
   cd /var/www/icsrt/icsrt-db
   pm2 start server.js --name "icsrt-backend"
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/icsrt
   ```

   Add this configuration:
   ```nginx
   # Backend API
   server {
       listen 80;
       server_name api.icsrt.cloud;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   
   # Admin Dashboard
   server {
       listen 80;
       server_name admin.icsrt.cloud;
       root /var/www/icsrt/icsrt-dashboard/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   
   # User Website
   server {
       listen 80;
       server_name icsrt.cloud;
       root /var/www/icsrt/icsrt-userpage/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

8. **Enable Site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/icsrt /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

9. **Install SSL Certificate:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d icsrt.cloud -d admin.icsrt.cloud -d api.icsrt.cloud
   ```

### Option C: Docker Deployment

1. **Create `Dockerfile` in `icsrt-db/`:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Create `docker-compose.yml` in root:**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./icsrt-db
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=${MONGODB_URI}
         - EMAIL_USER=${EMAIL_USER}
         - EMAIL_PASS=${EMAIL_PASS}
         - JWT_SECRET=${JWT_SECRET}
         - API_URL=https://api.icsrt.cloud
         - FRONTEND_URL=https://icsrt.cloud
         - CORS_ORIGINS=https://icsrt.cloud,https://admin.icsrt.cloud
       restart: unless-stopped
   ```

3. **Build and Run:**
   ```bash
   docker-compose up -d
   ```

---

## ✅ Post-Deployment Testing

### 1. API Health Check

Visit: `https://api.icsrt.cloud/api/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-06T...",
  "database": "connected"
}
```

### 2. CORS Test

Open browser console on `https://icsrt.cloud`:
```javascript
fetch('https://api.icsrt.cloud/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ CORS working:', data))
  .catch(err => console.error('❌ CORS error:', err));
```

### 3. Email Test

1. Register a new user
2. Check email inbox for verification email
3. Check server logs: `pm2 logs icsrt-backend` or hosting logs

Expected log:
```
📧 Email configured and ready
✅ Verification email sent to: test@example.com
```

### 4. Dashboard Test

1. Visit: `https://admin.icsrt.cloud`
2. Login with admin credentials
3. Check all pages load without errors
4. Open browser console - no errors should appear

### 5. User Website Test

1. Visit: `https://icsrt.cloud`
2. Browse all pages
3. Test contact form
4. Test registration/login
5. Check browser console - no errors

### 6. Database Connection Test

Check server logs for:
```
✅ Connected to MongoDB Atlas - Database: icsrt_main
```

---

## 🔧 Troubleshooting

### CORS Errors

**Symptom:** Browser console shows CORS errors

**Solution:**
1. Verify `CORS_ORIGINS` in `.env`:
   ```bash
   CORS_ORIGINS=https://icsrt.cloud,https://admin.icsrt.cloud,https://api.icsrt.cloud
   ```

2. Check server logs for:
   ```
   ⚠️ CORS blocked request from: https://...
   ```

3. Restart server after changing `.env`

4. Clear browser cache and cookies

### Email Not Sending

**Symptom:** No verification emails received

**Solution:**
1. Check `.env` has `EMAIL_USER` and `EMAIL_PASS`
2. Verify Gmail App Password is correct (16 characters)
3. Check server logs for email errors
4. See `EMAIL-SETUP-PRODUCTION.md` for detailed troubleshooting

### Database Connection Failed

**Symptom:** "MongoDB connection error" in logs

**Solution:**
1. Verify `MONGODB_URI` in `.env` is correct
2. Check MongoDB Atlas whitelist includes your server IP
3. Verify database user credentials are correct
4. Test connection string using MongoDB Compass

### 502 Bad Gateway / Server Not Responding

**Symptom:** Website shows 502 error

**Solution:**
1. Check if backend is running:
   ```bash
   pm2 status
   # or
   ps aux | grep node
   ```

2. Check backend logs:
   ```bash
   pm2 logs icsrt-backend
   ```

3. Restart backend:
   ```bash
   pm2 restart icsrt-backend
   ```

4. Verify port 3000 is open and not blocked by firewall

### SSL/HTTPS Issues

**Symptom:** "Your connection is not private" warning

**Solution:**
1. Install/renew SSL certificate
2. Check certificate validity:
   ```bash
   sudo certbot certificates
   ```

3. Renew if expired:
   ```bash
   sudo certbot renew
   ```

### Frontend Shows Blank Page

**Symptom:** White screen or blank page

**Solution:**
1. Check if build was successful:
   ```bash
   cd icsrt-dashboard
   npm run build
   
   cd ../icsrt-userpage
   npm run build
   ```

2. Verify web server is serving build folder
3. Check browser console for errors
4. Verify API_URL in frontend `.env` files

---

## 📊 Monitoring & Maintenance

### Check Server Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs icsrt-backend

# Server resources
htop
```

### Automated Backups

Setup daily MongoDB backups:
```bash
# Create backup script
cat > /root/backup-mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --uri="your-mongodb-uri" --out="$BACKUP_DIR/backup_$TIMESTAMP"
# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x /root/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-mongodb.sh
```

### Update Checklist

When updating code:
```bash
# 1. Backup database
mongodump --uri="your-uri"

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install --production

# 4. Rebuild frontend
cd icsrt-dashboard && npm run build
cd ../icsrt-userpage && npm run build

# 5. Restart backend
pm2 restart icsrt-backend

# 6. Test
curl https://api.icsrt.cloud/api/health
```

---

## 🆘 Support & Resources

- **Email Setup Guide:** `EMAIL-SETUP-PRODUCTION.md`
- **Project Documentation:** `README.md`
- **API Documentation:** Check `/api` endpoints in `server.js`

### Common Commands

```bash
# Restart services
pm2 restart all

# View logs
pm2 logs

# Check process status
pm2 status

# Stop all services
pm2 stop all

# Check disk space
df -h

# Check memory usage
free -m

# Check server load
uptime
```

---

## ✅ Deployment Checklist Summary

Before going live, verify:

- [ ] Environment variables configured (`.env`)
- [ ] CORS origins set correctly
- [ ] Email configuration tested
- [ ] Database connection working
- [ ] JWT secret changed from default
- [ ] SSL certificates installed
- [ ] All domains pointing correctly
- [ ] Frontend built successfully
- [ ] Backend server running
- [ ] Health endpoint responding
- [ ] Test user registration
- [ ] Test email delivery
- [ ] Test dashboard login
- [ ] Test payment flow (if applicable)
- [ ] Browser console shows no errors
- [ ] Server logs show no critical errors

---

## 🎉 Success!

Once all checks pass, your ICSRT++ system is **fully deployed and production-ready**!

Monitor logs for the first few hours and respond to any issues immediately.

---

**Last Updated:** November 6, 2025
**Version:** 1.0
