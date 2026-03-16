# 🚀 Production Deployment Guide - Same Server Setup

## 📋 Overview

This guide shows how to deploy both **frontend and backend on the SAME server** at `icsrt.cloud`. This is the simplest setup and doesn't require a separate API subdomain.

---

## ✅ What Changed

I've updated the system to work with **backend and frontend on the same domain**:

### Frontend Changes:
- ✅ Auto-detects to use `https://icsrt.cloud` for API calls (same as website)
- ✅ No need for separate `api.icsrt.cloud` subdomain
- ✅ Works with reverse proxy setup

### Backend Changes:
- ✅ CORS allows requests from same domain
- ✅ Accepts: `https://icsrt.cloud`, `https://www.icsrt.cloud`, `https://admin.icsrt.cloud`
- ✅ Already configured dynamically

---

## 🏗️ Deployment Architecture

```
Server with Multiple Domains
│
├── icsrt.cloud
│   ├── Frontend (React Userpage)
│   │   └── /var/www/icsrt/
│   │       └── build/
│   └── Backend (via reverse proxy)
│       └── /api/* → Node.js on port 3000
│
├── admin.icsrt.cloud
│   ├── Frontend (React Dashboard)
│   │   └── /var/www/admin/
│   │       └── build/
│   └── Backend (via reverse proxy)
│       └── /api/* → Node.js on port 3000
│
└── Backend Server (Node.js)
    └── /var/www/api/
        ├── server.js (running on port 3000)
        └── Serves both domains via reverse proxy
```

**How it works:**
- `https://icsrt.cloud` → Userpage frontend
- `https://icsrt.cloud/api/*` → Proxies to backend (port 3000)
- `https://admin.icsrt.cloud` → Dashboard frontend
- `https://admin.icsrt.cloud/api/*` → Proxies to backend (port 3000)
- Same backend serves both domains!
- Same domain = No CORS issues!

---

## 📦 Step 1: Build Frontend

On your local computer:

```bash
# Build userpage
cd icsrt-userpage
npm run build
# Creates: build/ folder

# Build dashboard
cd ../icsrt-dashboard
npm run build
# Creates: build/ folder
```

---

## 📤 Step 2: Upload Files to Server

### Upload Frontend (Userpage):
```bash
# Upload icsrt-userpage/build/ contents to:
/var/www/icsrt/
# This will be served at icsrt.cloud
```

### Upload Frontend (Dashboard):
```bash
# Upload icsrt-dashboard/build/ contents to:
/var/www/admin/
# This will be served at admin.icsrt.cloud
```

### Upload Backend:
```bash
# Upload entire icsrt-db/ folder to:
/var/www/api/
# This will serve API for both domains
```

---

## ⚙️ Step 3: Configure Backend on Server

SSH into your server and:

```bash
# Navigate to backend folder
cd /var/www/api/

# Install dependencies
npm install

# Create production .env file
nano .env
```

**Production .env:**
```env
NODE_ENV=production
PORT=3000

# MongoDB (use your production database)
MONGODB_URI=mongodb://localhost:27017/icsrt_db
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/icsrt_db

# JWT Secret
JWT_SECRET=your-super-secret-key-change-this

# Email Configuration (REQUIRED for registration)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Paymob (if you have these)
PAYMOB_API_KEY=your-api-key
PAYMOB_IFRAME_ID=your-iframe-id
PAYMOB_HMAC_SECRET=your-hmac-secret
```

**Start backend with PM2:**
```bash
# Install PM2 (process manager)
npm install -g pm2

# Start server
pm2 start server.js --name icsrt-backend

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

**Verify backend is running:**
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok",...}
```

---

## 🌐 Step 4: Configure Reverse Proxy

### Option A: Nginx (Recommended)

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/icsrt
```

**Nginx Configuration:**
```nginx
# Userpage: icsrt.cloud
server {
    listen 80;
    listen [::]:80;
    server_name icsrt.cloud www.icsrt.cloud;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name icsrt.cloud www.icsrt.cloud;

    ssl_certificate /etc/letsencrypt/live/icsrt.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/icsrt.cloud/privkey.pem;

    # Userpage Frontend
    root /var/www/icsrt;
    index index.html;

    # API Backend (proxy to Node.js)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads folder
    location /uploads/ {
        alias /var/www/api/uploads/;
        autoindex off;
    }

    # Frontend routing (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Dashboard: admin.icsrt.cloud
server {
    listen 80;
    listen [::]:80;
    server_name admin.icsrt.cloud;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.icsrt.cloud;

    ssl_certificate /etc/letsencrypt/live/admin.icsrt.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.icsrt.cloud/privkey.pem;

    # Dashboard Frontend
    root /var/www/admin;
    index index.html;

    # API Backend (same backend, different domain)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads folder (same as userpage)
    location /uploads/ {
        alias /var/www/api/uploads/;
        autoindex off;
    }

    # Frontend routing (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Enable and test:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/icsrt /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option B: Apache

Create Apache config:
```bash
sudo nano /etc/apache2/sites-available/icsrt.conf
```

**Apache Configuration:**
```apache
<VirtualHost *:80>
    ServerName icsrt.cloud
    ServerAlias www.icsrt.cloud
    
    # Redirect to HTTPS
    Redirect permanent / https://icsrt.cloud/
</VirtualHost>

<VirtualHost *:443>
    ServerName icsrt.cloud
    ServerAlias www.icsrt.cloud
    
    # SSL
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/icsrt.cloud/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/icsrt.cloud/privkey.pem
    
    # Frontend
    DocumentRoot /var/www/html
    
    # API Proxy
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/
    
    # Uploads
    Alias /uploads /var/www/api/uploads
    
    # React Router
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router fallback
        FallbackResource /index.html
    </Directory>
</VirtualHost>
```

**Enable and restart:**
```bash
# Enable modules
sudo a2enmod ssl proxy proxy_http rewrite

# Enable site
sudo a2ensite icsrt

# Test and restart
sudo apache2ctl configtest
sudo systemctl restart apache2
```

---

## 🔒 Step 5: SSL Certificate (HTTPS)

**Install Certbot:**
```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install certbot

# For Nginx
sudo apt install python3-certbot-nginx

# For Apache
sudo apt install python3-certbot-apache
```

**Get SSL Certificate:**
```bash
# Get certificates for both domains
sudo certbot --nginx -d icsrt.cloud -d www.icsrt.cloud -d admin.icsrt.cloud

# Or separately:
sudo certbot --nginx -d icsrt.cloud -d www.icsrt.cloud
sudo certbot --nginx -d admin.icsrt.cloud
```

**Auto-renewal:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up renewal cron job
```

---

## ✅ Step 6: Verify Deployment

### Test Backend:
```bash
curl https://icsrt.cloud/api/health
# Should return: {"status":"ok",...}
```

### Test Frontend:
1. **Userpage:** Open browser: `https://icsrt.cloud`
2. **Dashboard:** Open browser: `https://admin.icsrt.cloud`
3. Open browser console (F12) on each
4. **Userpage should show:** `📡 Production detected, using same domain for API: https://icsrt.cloud`
5. **Dashboard should show:** `📡 Dashboard on admin.icsrt.cloud using API: https://admin.icsrt.cloud`
6. Try to sign up or login on both
7. Check that API calls work

### Test CORS:
1. Login to userpage at `https://icsrt.cloud`
2. Login to dashboard at `https://admin.icsrt.cloud`
3. Try to submit a service order on userpage
4. Check backend logs: `pm2 logs icsrt-backend`
5. Should see: 
   - `✅ Production origin allowed: https://icsrt.cloud`
   - `✅ Production origin allowed: https://admin.icsrt.cloud`

---

## 🐛 Troubleshooting

### Frontend shows but API doesn't work:
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs icsrt-backend

# Restart backend
pm2 restart icsrt-backend
```

### CORS errors:
```bash
# Check backend logs for CORS messages
pm2 logs icsrt-backend | grep CORS

# Make sure origin is being allowed
# Should see: ✅ Production origin allowed: https://icsrt.cloud
```

### API returns 502 Bad Gateway:
```bash
# Backend is not running or crashed
pm2 status
pm2 restart icsrt-backend

# Check if port 3000 is open
netstat -tlnp | grep 3000
```

### Frontend routing doesn't work:
- Make sure Nginx/Apache is configured with `try_files` or `FallbackResource`
- React Router needs server to always serve index.html

---

## 📊 Monitoring

**Check backend status:**
```bash
pm2 status
pm2 logs icsrt-backend
pm2 monit
```

**Check server resources:**
```bash
htop
df -h  # Disk space
free -m  # Memory
```

**Check Nginx/Apache:**
```bash
# Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Apache
sudo systemctl status apache2
sudo tail -f /var/log/apache2/error.log
```

---

## 🔄 Updating

### Update Frontend:
```bash
# On local computer
cd icsrt-userpage
npm run build

# Upload new build/ contents to server
# Replace /var/www/html/ contents
```

### Update Backend:
```bash
# On server
cd /var/www/api
git pull  # if using git
# or upload new files

npm install  # if package.json changed
pm2 restart icsrt-backend
```

---

## 📝 Summary

**Your setup:**
- ✅ Userpage: `https://icsrt.cloud` (React static files)
- ✅ Userpage API: `https://icsrt.cloud/api/*` (Node.js via reverse proxy)
- ✅ Dashboard: `https://admin.icsrt.cloud` (React static files)
- ✅ Dashboard API: `https://admin.icsrt.cloud/api/*` (Node.js via reverse proxy)
- ✅ Backend: One Node.js server serves both domains
- ✅ Same domain for each = No CORS issues
- ✅ PM2 manages backend process
- ✅ Nginx serves frontends + proxies API
- ✅ SSL certificates for both domains

**Benefits:**
- 🚀 Simpler setup (one domain)
- 💰 No need for separate API server
- 🔒 Better security (same-origin)
- ⚡ Faster (no cross-domain requests)

---

## 🎉 Done!

Your website should now be fully functional at `https://icsrt.cloud`!

All API calls from the frontend will automatically go to the same domain with `/api/` prefix, and the reverse proxy will forward them to your Node.js backend.

**Test it:** Go to `https://icsrt.cloud` and try signing up, logging in, and ordering services!
