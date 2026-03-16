# Quick Production Email Fix for ICSRT

## The Problem
Emails don't work in production because the `.env` file with email credentials is not on the production server.

## The Solution (5 Minutes)

### Step 1: Get Your Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Generate an App Password for "Mail"
3. Copy the 16-character code (e.g., `abcdefghijklmnop`)

### Step 2: Add to Production Server

**Via Hostinger File Manager:**
1. Login to Hostinger → File Manager
2. Navigate to `/home/username/icsrt-db/`
3. Find `.env` file (or create if doesn't exist)
4. Click Edit
5. Add these two lines:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```
6. Click Save
7. Restart Node.js app (see Step 3)

**Via SSH (Faster):**
```bash
# Login to your server via SSH
ssh username@your-server.com

# Navigate to icsrt-db folder
cd ~/icsrt-db

# Add email config
echo "EMAIL_USER=your-email@gmail.com" >> .env
echo "EMAIL_PASS=your-app-password" >> .env

# Restart the server (see Step 3)
```

### Step 3: Restart Application

**If using PM2:**
```bash
pm2 restart icsrt-backend
pm2 logs icsrt-backend
```

**If using screen/nohup:**
```bash
pkill -f "node server.js"
nohup node server.js > server.log 2>&1 &
```

**If using Hostinger Node.js App:**
- Go to Node.js Apps → Click your app → Click "Restart"

### Step 4: Verify It's Working

**Method 1: Check Health Endpoint**

Open in browser:
```
https://admin.icsrt.cloud/api/health
```

Should show:
```json
{
  "email": {
    "configured": true,
    "status": "Email service active"
  }
}
```

**Method 2: Test Signup**

1. Go to https://icsrt.cloud/signup
2. Register with a real email address
3. Check email inbox for verification code
4. If you receive the email → ✅ Working!

**Method 3: Check Server Logs**

```bash
# If using PM2
pm2 logs icsrt-backend | grep "Email configured"

# Should show:
# 📧 Email configured with: your-email@gmail.com
```

## Troubleshooting

### Still says "development mode"?
- ✅ Verify .env file is in `/icsrt-db/` folder (same folder as server.js)
- ✅ Check file has correct format (no quotes around values)
- ✅ Restart Node.js application
- ✅ Wait 30 seconds for server to fully restart

### "Invalid login" error?
- ✅ Use App Password, not regular Gmail password
- ✅ Enable 2FA first: https://myaccount.google.com/security
- ✅ Generate new App Password: https://myaccount.google.com/apppasswords

### Email not received?
- ✅ Check spam folder
- ✅ Verify email address is correct
- ✅ Check server logs for errors
- ✅ Test with different email provider (not Gmail)

## Quick Command to Fix Everything

Copy this entire command and run on your production server:

```bash
cd ~/icsrt-db && \
read -p "Enter Gmail address: " EMAIL_USER && \
read -p "Enter App Password: " EMAIL_PASS && \
echo "EMAIL_USER=$EMAIL_USER" >> .env && \
echo "EMAIL_PASS=$EMAIL_PASS" >> .env && \
echo "✅ Email configured!" && \
pm2 restart icsrt-backend && \
sleep 3 && \
pm2 logs icsrt-backend --lines 20 | grep -A 5 "Email configured"
```

This will:
1. Ask for your email & password
2. Add to .env file
3. Restart server
4. Show logs to confirm it worked

## What This Fixes

Once configured, these features will work:
- ✅ Email verification codes for signup
- ✅ Newsletter sending from dashboard
- ✅ Password reset emails
- ✅ Service order notifications
- ✅ All email communication

## Need More Help?

1. **Check server logs**: `pm2 logs icsrt-backend`
2. **Run health check**: Open `https://admin.icsrt.cloud/api/health`
3. **Test email script**: `node test-email.js` (on server)

---

**File locations on production server:**
- Main server: `~/icsrt-db/server.js`
- Config file: `~/icsrt-db/.env`
- Logs: `~/.pm2/logs/` or `~/icsrt-db/server.log`
