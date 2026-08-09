# Deployment Configuration Guide for icsrt.cloud

## Environment Variables Configuration

### Backend (.env in icsrt-db folder)

```properties
# Node Environment
NODE_ENV=production
PORT=3000

# API URLs - UPDATE THESE FOR PRODUCTION
API_URL=https://api.icsrt.cloud
FRONTEND_URL=https://icsrt.cloud

# CORS Configuration - CRITICAL FOR PRODUCTION
CORS_ORIGINS=https://icsrt.cloud,https://www.icsrt.cloud,https://admin.icsrt.cloud,https://api.icsrt.cloud

# Database - UPDATE WITH YOUR PRODUCTION MONGODB
MONGODB_URI=mongodb://localhost:27017/icsrt_db
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/icsrt_db

# JWT Secret - CHANGE THIS IN PRODUCTION
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Paymob Payment Integration
PAYMOB_API_KEY=egy_sk_test_2e9e4e5ecb9102ce8b5280e8a91ddbca8fe22d93f06e61a31bf9ffcd6ff79b19
PAYMOB_PUBLIC_KEY=egy_pk_test_EkdCVViBy09fzkFx6gOSoaazj81XWVoL
PAYMOB_AUTH_TOKEN=your_base64_token
PAYMOB_CARD_INTEGRATION_ID=5232435
PAYMOB_WALLET_INTEGRATION_ID=5232441
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret
```

### Frontend (.env in icsrt-userpage folder)

```properties
# API Base URL - MUST MATCH YOUR BACKEND
REACT_APP_API_BASE_URL=https://api.icsrt.cloud
```

## Deployment Steps

### 1. Backend Deployment (api.icsrt.cloud)

1. **Upload backend files** to your server:
   ```bash
   /var/www/api.icsrt.cloud/
   ├── server.js
   ├── package.json
   ├── .env (with production values)
   ├── uploads/ (create this folder)
   └── ... (all other backend files)
   ```

2. **Install dependencies**:
   ```bash
   cd /var/www/api.icsrt.cloud
   npm install
   ```

3. **Set correct permissions**:
   ```bash
   chmod 755 uploads
   ```

4. **Start the server**:
   ```bash
   # Using PM2 (recommended)
   pm2 start server.js --name icsrt-api
   pm2 save
   pm2 startup

   # OR using node directly
   node server.js
   ```

### 2. Frontend Deployment (icsrt.cloud)

1. **Update .env file** with production API URL:
   ```bash
   cd icsrt-userpage
   nano .env
   # Set: REACT_APP_API_BASE_URL=https://api.icsrt.cloud
   ```

2. **Build the production bundle**:
   ```bash
   npm run build
   ```

3. **Upload build folder** to your web server:
   ```bash
   # Upload contents of 'build' folder to:
   /var/www/icsrt.cloud/
   ```

4. **Configure web server** (Apache/Nginx):

   **For Apache (.htaccess)**:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **For Nginx**:
   ```nginx
   server {
     listen 80;
     server_name icsrt.cloud www.icsrt.cloud;
     root /var/www/icsrt.cloud;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     location /api {
       proxy_pass https://api.icsrt.cloud;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

### 3. Dashboard Deployment (admin.icsrt.cloud)

1. **Build dashboard**:
   ```bash
   cd icsrt-dashboard
   npm run build
   ```

2. **Upload to server**:
   ```bash
   # Upload 'build' folder contents to:
   /var/www/admin.icsrt.cloud/
   ```

3. **Configure the same way as userpage**

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution 1: Check CORS_ORIGINS in backend .env**
```properties
CORS_ORIGINS=https://icsrt.cloud,https://www.icsrt.cloud,https://admin.icsrt.cloud
```

**Solution 2: Check API URL in frontend .env**
```properties
REACT_APP_API_BASE_URL=https://api.icsrt.cloud
```

**Solution 3: Restart backend after .env changes**
```bash
pm2 restart icsrt-api
```

### Issue: 404 Not Found on refresh

**Solution**: Configure web server for SPA routing (see Apache/Nginx config above)

### Issue: File uploads not working

**Solution 1**: Create uploads folder
```bash
mkdir /var/www/api.icsrt.cloud/uploads
chmod 755 /var/www/api.icsrt.cloud/uploads
```

**Solution 2**: Check file size limits in web server config

### Issue: Database connection failed

**Solution**: Update MONGODB_URI in backend .env
```properties
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/icsrt_db

# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/icsrt_db
```

## Testing After Deployment

1. **Test API health**:
   ```bash
   curl https://api.icsrt.cloud/api/health
   ```

2. **Test frontend loads**:
   ```
   Open https://icsrt.cloud in browser
   ```

3. **Test login**:
   - Go to https://icsrt.cloud/login
   - Try logging in

4. **Check browser console**:
   - Open DevTools (F12)
   - Look for API connection logs (should show correct API URL)
   - Look for any CORS errors

## Domain DNS Configuration

Make sure your DNS is configured:

```
A Record:    icsrt.cloud        → Your_Server_IP
A Record:    www.icsrt.cloud    → Your_Server_IP
A Record:    admin.icsrt.cloud  → Your_Server_IP
A Record:    api.icsrt.cloud    → Your_Server_IP
```

## SSL Certificate (HTTPS)

Install Let's Encrypt certificate:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates for all domains
sudo certbot --nginx -d icsrt.cloud -d www.icsrt.cloud -d admin.icsrt.cloud -d api.icsrt.cloud

# Auto-renewal
sudo certbot renew --dry-run
```

---

**After deployment, the system will automatically detect the domain and use the correct API URL!**
