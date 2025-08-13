# Quick Fix for Social Media Management System

## Issue
The dashboard shows "Endpoint not found" when trying to access social media management.

## Solution

### Step 1: Start the Database Server
```powershell
cd icsrt-db
node server.js
```

### Step 2: Test the Social Media API
Open another terminal and test:
```powershell
curl http://localhost:3000/api/social-links
```

### Step 3: If Step 2 fails, the server isn't running properly
- Check if port 3000 is already in use
- Verify MongoDB connection
- Check for any errors in the server console

### Step 4: Create Default Social Links
```powershell
cd icsrt-db
node setup-default-social-links.js
```

### Step 5: Access Dashboard
1. Go to http://localhost:3001
2. Login with admin credentials
3. Click "Social Media" in the sidebar

## Quick Debug Script

Run this to test everything:

```javascript
// test-social-fix.js
const fetch = require('node-fetch');

async function test() {
  try {
    const response = await fetch('http://localhost:3000/api/social-links');
    const data = await response.json();
    console.log('✅ Social Media API working!');
    console.log('Links found:', data.data?.length || 0);
  } catch (error) {
    console.log('❌ Server not running or API not working');
    console.log('Error:', error.message);
  }
}

test();
```

## Manual Server Start (Alternative)

If automatic startup fails, manually run:

1. **Terminal 1** (Database):
   ```
   cd icsrt-db
   node server.js
   ```

2. **Terminal 2** (Dashboard):
   ```
   cd icsrt-dashboard
   npm start
   ```

3. **Terminal 3** (User Page):
   ```
   cd icsrt-userpage
   npm start
   ```

## Verification

1. Database API: http://localhost:3000/api/social-links
2. Dashboard: http://localhost:3001 (Social Media section)
3. User Page: http://localhost:3002 (Check footer for social links)

## Common Issues

- **Port 3000 in use**: Kill existing processes or use different port
- **MongoDB connection**: Check internet connection and credentials
- **CORS errors**: Restart server after changes
- **Dashboard not loading**: Check if npm start worked properly
