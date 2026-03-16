# 🚀 Quick Deployment Steps

## ❌ Current Problem

Your **production website** (`https://icsrt.cloud`) is running **OLD CODE** that tries to use `https://api.icsrt.cloud`, but:
1. There's no backend at `api.icsrt.cloud` (404 error)
2. The new code with auto-detection isn't deployed yet

## ✅ Solution: Deploy NEW Build

### Step 1: Upload New Builds to Server

You now have updated builds in:
- `icsrt-userpage/build/` → Upload to `icsrt.cloud`
- `icsrt-dashboard/build/` → Upload to `admin.icsrt.cloud`

**How to upload:**
```bash
# Via FTP/SFTP:
# - Connect to your hosting
# - Replace ALL files in your website folder with new build/ contents

# Via command line (if you have SSH):
scp -r icsrt-userpage/build/* user@your-server:/var/www/icsrt/
scp -r icsrt-dashboard/build/* user@your-server:/var/www/admin/
```

### Step 2: Deploy Backend to Server

**Upload backend:**
```bash
# Upload icsrt-db/ folder to your server
scp -r icsrt-db/ user@your-server:/var/www/api/
```

**On your server (SSH):**
```bash
cd /var/www/api/
npm install
pm2 start server.js --name icsrt-backend
```

### Step 3: Configure Nginx on Server

**Create/edit nginx config:**
```bash
sudo nano /etc/nginx/sites-available/icsrt
```

**Add the config from PRODUCTION-DEPLOYMENT-SAME-SERVER.md**

**Enable and reload:**
```bash
sudo ln -s /etc/nginx/sites-available/icsrt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Get SSL Certificates

```bash
sudo certbot --nginx -d icsrt.cloud -d www.icsrt.cloud -d admin.icsrt.cloud
```

### Step 5: Test

1. Clear browser cache (Ctrl+Shift+Delete)
2. Visit `https://icsrt.cloud`
3. Check console - should see: `📡 Production detected, using same domain for API: https://icsrt.cloud`
4. Try to login

---

## 🔍 Why It's Not Working Now

Looking at your screenshot:
- ✅ Console shows: `Using API URL from env: https://api.icsrt.cloud`
- ❌ This means OLD code is running (before my changes)
- ❌ Trying to reach `api.icsrt.cloud` but nothing is there

**After deploying new build:**
- ✅ Console will show: `📡 Production detected, using same domain for API: https://icsrt.cloud`
- ✅ Will call: `https://icsrt.cloud/api/auth/login`
- ✅ Nginx will proxy to backend on port 3000
- ✅ Everything works!

---

## 📁 What Files to Upload

### To `icsrt.cloud`:
```
icsrt-userpage/build/
├── index.html
├── favicon.ico
├── logo192.png
├── logo512.png
├── manifest.json
├── robots.txt
├── asset-manifest.json
└── static/
    ├── css/
    │   └── main.*.css
    └── js/
        └── main.*.js
```

### To `admin.icsrt.cloud`:
```
icsrt-dashboard/build/
├── index.html
├── static/
    ├── css/
    └── js/
```

### To backend location (e.g., `/var/www/api/`):
```
icsrt-db/
├── server.js
├── package.json
├── .env (create on server)
└── node_modules/ (will be created by npm install)
```

---

## 🎯 Quick Fix (If You Just Want to Test)

If you can't deploy to production right now, test locally:

```bash
# Terminal 1: Start backend
cd icsrt-db
node server.js

# Terminal 2: Start userpage
cd icsrt-userpage
npm start

# Open: http://localhost:3002
```

This will work immediately!

---

## 📞 Summary

**Current situation:**
- ❌ Old code deployed on `icsrt.cloud`
- ❌ Trying to use `api.icsrt.cloud` (doesn't exist)
- ❌ Getting 404 errors

**What you need to do:**
1. ✅ Upload new `build/` folder to `icsrt.cloud` (replaces old code)
2. ✅ Upload backend to server
3. ✅ Configure Nginx with reverse proxy
4. ✅ Start backend with PM2
5. ✅ Get SSL certificates

**After deployment:**
- ✅ `icsrt.cloud` → New frontend
- ✅ `icsrt.cloud/api/*` → Backend via Nginx
- ✅ Same domain = Works perfectly!

---

## 🚨 Important Notes

1. **Clear browser cache** after uploading new build, or users will still see old code
2. **Backend MUST be deployed** to your server - localhost won't work for production site
3. **Nginx/Apache reverse proxy** is required to route `/api/*` to backend
4. **SSL certificates** are required for HTTPS

---

Need help with your hosting provider's specific deployment process? Let me know which hosting you use!
