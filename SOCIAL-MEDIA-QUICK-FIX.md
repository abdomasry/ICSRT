// Quick fix instructions for Social Media Management

## Problem
Dashboard shows "Endpoint not found" for social media management.

## Immediate Solution

### Step 1: Start Test Server
```bash
cd icsrt-db
node social-test-server.js
```
This starts a test server on port 3010 with working social media endpoints.

### Step 2: Update Dashboard API URL
In `icsrt-dashboard/src/pages/SocialMediaManagement.jsx`, temporarily change:

```javascript
// FROM:
const API_BASE_URL = 'http://localhost:3000';

// TO:
const API_BASE_URL = 'http://localhost:3010';
```

### Step 3: Start Dashboard
```bash
cd icsrt-dashboard
npm start
```

### Step 4: Test Social Media Management
1. Open http://localhost:3001
2. Login with admin credentials
3. Click "Social Media" in sidebar
4. You should now see the interface working with test data

## Permanent Fix

Once you confirm the dashboard works with the test server:

### Option A: Fix Main Server
1. Ensure the main server (port 3000) is running:
   ```bash
   cd icsrt-db
   node server.js
   ```

2. Test the main server endpoints:
   ```bash
   curl http://localhost:3000/api/social-links
   ```

3. If working, change API_BASE_URL back to 'http://localhost:3000'

### Option B: Debug Main Server
If the main server endpoints don't work:

1. Check server console for errors
2. Verify MongoDB connection
3. Ensure social media endpoints are properly loaded
4. Check for port conflicts

## Verification

Test these URLs in your browser:
- Test server: http://localhost:3010/test
- Test social links: http://localhost:3010/api/social-links
- Main server: http://localhost:3000/api/social-links

## Files Modified

- `social-test-server.js` - Test server with working endpoints
- `SocialMediaManagement.jsx` - Change API_BASE_URL temporarily
