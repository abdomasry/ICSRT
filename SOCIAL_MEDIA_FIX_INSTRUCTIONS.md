# 🔧 SOCIAL MEDIA MANAGEMENT FIX INSTRUCTIONS

## 🚨 Problem Identified
The Social Media Management is showing **404 errors** because:
- The backend server is NOT running on port 3000
- OR the server is running but missing the social links routes

## ✅ SOLUTION STEPS

### Step 1: Start the Backend Server
You MUST start the backend server first:

```bash
# Open PowerShell or Command Prompt
cd "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"
node server.js
```

**OR use the batch file:**
```bash
cd "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"
start-fresh-server.bat
```

### Step 2: Verify Server is Running
You should see this output:
```
🚀 ICSRT Backend Server running on port 3000
🏥 API Health: http://localhost:3000/api/health
```

### Step 3: Test the Server
Open a new PowerShell window and run:
```bash
cd "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-db"
node test-server-connectivity.js
```

### Step 4: Start the Dashboard
Only AFTER the backend is running:
```bash
cd "d:\Abdo\WORK\Real Projects\ICSRT++\icsrt-dashboard"
npm start
```

### Step 5: Test Social Media Management
1. Go to the dashboard: http://localhost:3001
2. Navigate to Social Media Management
3. Click "🚀 Run Diagnostics" to test connectivity
4. You should see ✅ SUCCESS messages instead of ❌ 404 errors

## 🔍 TROUBLESHOOTING

### If you still get 404 errors:

1. **Check if server is actually running:**
   - Look for "🚀 ICSRT Backend Server running on port 3000" message
   - Open http://localhost:3000/test in browser (should show JSON response)

2. **Check for port conflicts:**
   ```bash
   netstat -ano | findstr :3000
   ```
   - If another process is using port 3000, kill it or change the port

3. **Check firewall/antivirus:**
   - Temporarily disable firewall
   - Add exception for Node.js

4. **Restart everything:**
   - Close all terminals
   - Kill any Node.js processes
   - Start backend server first, then dashboard

## ✅ FIXED COMPONENTS

I have already fixed these issues in the code:
- ✅ Added `/test` endpoint for diagnostics
- ✅ Fixed function name mismatches (handleDeleteLink → handleDelete)
- ✅ Enhanced error handling with detailed logging
- ✅ Added comprehensive diagnostic component
- ✅ Verified social links API module is working correctly

## 📋 EXPECTED BEHAVIOR

When working correctly, you should see:
- 📊 Total Links: [number]
- ✅ Active Links: [number] 
- ❌ Disabled Links: [number]
- Ability to add, edit, delete, and toggle social links
- No 404 errors in browser console

The main issue is simply that the **backend server needs to be running first**!
