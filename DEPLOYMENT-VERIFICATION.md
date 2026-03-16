# Deployment Verification Checklist

## Pre-Deployment Verification

Before deploying to Hostinger, verify these configuration files:

### 1. Frontend API Configuration Check

**For Dashboard** (`icsrt-dashboard/src/lib/api.js`):
```javascript
// Deployed at: https://admin.icsrt.cloud
// Should detect:
- admin.icsrt.cloud → https://api.icsrt.cloud
- localhost → http://localhost:3000 (development)
```

**For User Page** (`icsrt-userpage/src/lib/api.js`):
```javascript
// Deployed at: https://icsrt.cloud
// Should detect:
- icsrt.cloud → https://api.icsrt.cloud
- localhost → http://localhost:3000 (development)
```

### 2. Backend Configuration Check

**CORS Configuration** (`icsrt-db/server.js`):
- ✅ Production domains added: `https://icsrt.cloud`, `https://admin.icsrt.cloud`
- ✅ Helmet configured for cross-origin requests
- ✅ Production domains always allowed (line 97-98)

### 3. Environment Variables

Create these files on your Hostinger server:

**Backend** (`.env` in `icsrt-db/`):
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_uri
API_URL=https://api.icsrt.cloud
FRONTEND_URL=https://icsrt.cloud

# Optional but recommended
CORS_ORIGINS=https://icsrt.cloud,https://admin.icsrt.cloud
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
JWT_SECRET=your_secure_jwt_secret
```

**Frontend** (create BEFORE building):

**For User Page** (deployed at `https://icsrt.cloud`):
Create `.env.production` in `icsrt-userpage/`:
```bash
REACT_APP_API_BASE_URL=https://api.icsrt.cloud
```

**For Admin Dashboard** (deployed at `https://admin.icsrt.cloud`):
Create `.env.production` in `icsrt-dashboard/`:
```bash
REACT_APP_API_BASE_URL=https://api.icsrt.cloud
```

## Build Commands

### Step 1: User Page (https://icsrt.cloud)
```bash
cd icsrt-userpage
echo "REACT_APP_API_BASE_URL=https://api.icsrt.cloud" > .env.production
npm install
npm run build
# Upload contents of 'build' folder to https://icsrt.cloud
```

### Step 2: Admin Dashboard (https://admin.icsrt.cloud)
```bash
cd ../icsrt-dashboard
echo "REACT_APP_API_BASE_URL=https://api.icsrt.cloud" > .env.production
npm install
npm run build
# Upload contents of 'build' folder to https://admin.icsrt.cloud
```

### Backend
```bash
cd icsrt-db
npm install --production
# Create .env file with all variables
# No build needed - just run server.js
```

## Post-Deployment Testing

### 1. Test CORS

Open browser console on deployed site and run:
```javascript
fetch('https://api.icsrt.cloud/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Expected**: No CORS error, returns JSON response

### 2. Test API Connection

On deployed `icsrt.cloud`:
```javascript
fetch('https://api.icsrt.cloud/api/test')
  .then(r => r.json())
  .then(console.log);
```

**Expected**: Server responds without errors

### 3. Check Browser Console

- Open DevTools → Console
- Look for any "Mixed Content" errors (http vs https)
- Look for CORS errors
- Check Network tab - API calls should go to `https://api.icsrt.cloud`

### 4. Test Full Flow

1. Visit `https://icsrt.cloud`
2. Try logging in
3. Visit `https://admin.icsrt.cloud`
4. Try logging in as admin
5. Check browser console for any errors

## Common Issues & Solutions

### Issue 1: CORS Errors
**Error**: `Access-Control-Allow-Origin` error

**Solution**:
1. Check `NODE_ENV=production` is set on backend
2. Verify CORS_ORIGINS includes your domains
3. Restart backend server after changing `.env`

### Issue 2: API Not Found (404)
**Error**: `Failed to fetch` or 404 on API calls

**Solution**:
1. Check API server is running on Hostinger at `https://api.icsrt.cloud`
2. Verify domain `api.icsrt.cloud` points to your server
3. Check firewall allows port 3000 (or whatever port you use)
4. Test with: `curl https://api.icsrt.cloud/api/health`
5. Ensure `.env` has `NODE_ENV=production`

### Issue 3: Mixed Content Errors
**Error**: `Mixed Content: The page was loaded over HTTPS, but requested an insecure resource 'http://...`

**Solution**:
1. Ensure all domains use HTTPS
2. Build with `REACT_APP_API_BASE_URL=https://api.icsrt.cloud`
3. Or ensure runtime detection works (check hostname in browser)

### Issue 4: Environment Variables Not Working
**Error**: Still using localhost URLs in production

**Solution**:
1. Check you created `.env.production` before building
2. Check variables start with `REACT_APP_`
3. Rebuild after creating/updating `.env.production`
4. Clear browser cache

### Issue 5: API Base URL Using Localhost
**Symptom**: Network tab shows requests to `http://localhost:3000`

**Solution**:
1. Browser is seeing `localhost` as hostname
2. This shouldn't happen on deployed domain `icsrt.cloud`
3. If it does, hardcode in `.env.production`:
   ```bash
   REACT_APP_API_BASE_URL=https://api.icsrt.cloud
   ```

## Quick Test Script

Run this in browser console on deployed site to verify configuration:

```javascript
// Test 1: Check current API URL
console.log('Current hostname:', window.location.hostname);
console.log('Expected API:', window.location.hostname.includes('icsrt.cloud') ? 'https://api.icsrt.cloud' : 'http://localhost:3000');

// Test 2: Test API connectivity
fetch('https://api.icsrt.cloud/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ API Connected:', data))
  .catch(err => console.error('❌ API Failed:', err));

// Test 3: Check localStorage
console.log('Auth token present:', !!localStorage.getItem('icsrtToken') || !!localStorage.getItem('adminToken'));
```

## SSL Certificate Requirements

All domains must have valid SSL certificates:
- ✅ `icsrt.cloud` - HTTPS required
- ✅ `admin.icsrt.cloud` - HTTPS required  
- ✅ `api.icsrt.cloud` - HTTPS required

If you get SSL errors:
1. Get certificates from Hostinger (free SSL available)
2. Install certificates on all domains
3. Force HTTPS redirects

## Final Checklist

Before going live:
- [ ] SSL certificates installed on all 3 domains:
  - [ ] https://icsrt.cloud
  - [ ] https://admin.icsrt.cloud
  - [ ] https://api.icsrt.cloud
- [ ] Backend .env configured with NODE_ENV=production
- [ ] Backend .env has correct domains:
  - [ ] API_URL=https://api.icsrt.cloud
  - [ ] FRONTEND_URL=https://icsrt.cloud
  - [ ] CORS_ORIGINS=https://icsrt.cloud,https://admin.icsrt.cloud
- [ ] Frontend .env.production files created BEFORE build
- [ ] MongoDB connection string is correct
- [ ] API server is running on Hostinger at api.icsrt.cloud
- [ ] Firewall allows port 3000 (or your chosen port)
- [ ] DNS records configured for all domains
- [ ] User page uploaded to icsrt.cloud
- [ ] Admin dashboard uploaded to admin.icsrt.cloud
- [ ] Test login on https://icsrt.cloud
- [ ] Test login on https://admin.icsrt.cloud
- [ ] Test API calls from browser console (no CORS errors)
- [ ] No mixed content errors

## Still Having Issues?

Run this diagnostic and check the results:

```bash
# On your Hostinger server
cd icsrt-db
node -e "console.log('NODE_ENV:', process.env.NODE_ENV)"
node -e "console.log('API_URL:', process.env.API_URL)"
node -e "console.log('FRONTEND_URL:', process.env.FRONTEND_URL)"

# Test server startup
node server.js
# Should show API running on port 3000
```

**Note**: The system is designed to work automatically. If CORS issues persist:
1. Set `CORS_ORIGINS` environment variable explicitly
2. Ensure `NODE_ENV=production` on backend
3. Restart all servers after environment changes
