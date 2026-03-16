# 📧 Production Email Setup Guide

## ⚠️ CRITICAL: Email Not Working in Production?

If emails are not being sent in production (email verification, password reset, etc.), follow this guide to configure email properly on your production server.

---

## 🔍 Problem Diagnosis

### Symptoms:
- ✅ Emails work locally (development)
- ❌ Emails NOT sent in production
- ❌ Users cannot verify accounts
- ❌ Password reset emails not received

### Root Cause:
**Environment variables `EMAIL_USER` and `EMAIL_PASS` are not configured on the production server.**

---

## 🛠️ Solution: Configure Gmail for Production

### Step 1: Prepare Gmail Account

1. **Use a dedicated Gmail account** (don't use your personal email)
   - Create new: `icsrt.system@gmail.com` (or similar)
   - Or use existing business Gmail

2. **Enable 2-Factor Authentication (2FA)**:
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow setup wizard
   - ✅ **REQUIRED** - App passwords only work with 2FA enabled

3. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → Enter "ICSRT Production Server"
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
   - ⚠️  **Save it securely** - you won't see it again!

---

## 🔧 Step 2: Configure Production Server

### For Hostinger/cPanel:

1. **Access your hosting control panel**

2. **Find "Environment Variables" or "PHP Variables"**:
   - In cPanel: Software → Select PHP Version → Switch to PHP Options
   - Or: Advanced → Environment Variables

3. **Add these variables**:
   ```
   Variable Name: EMAIL_USER
   Value: your-gmail@gmail.com
   
   Variable Name: EMAIL_PASS
   Value: abcd efgh ijkl mnop (your 16-char app password, NO SPACES!)
   ```

4. **Also set** (if not already set):
   ```
   Variable Name: NODE_ENV
   Value: production
   
   Variable Name: FRONTEND_URL
   Value: https://icsrt.cloud
   
   Variable Name: API_URL
   Value: https://api.icsrt.cloud
   ```

5. **Save and restart** your Node.js application

---

### For VPS/Cloud Server (Ubuntu/Linux):

1. **SSH into your server**:
   ```bash
   ssh user@your-server-ip
   ```

2. **Edit environment file**:
   ```bash
   cd /path/to/icsrt-db
   nano .env
   ```

3. **Add/Update these lines**:
   ```bash
   NODE_ENV=production
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   FRONTEND_URL=https://icsrt.cloud
   API_URL=https://api.icsrt.cloud
   ```

4. **Save and exit** (Ctrl+X, Y, Enter)

5. **Restart Node.js application**:
   ```bash
   # If using PM2:
   pm2 restart icsrt-db
   
   # If using systemd:
   sudo systemctl restart icsrt-backend
   
   # If using forever:
   forever restartall
   ```

---

### For Docker Deployment:

1. **Update docker-compose.yml**:
   ```yaml
   services:
     icsrt-backend:
       environment:
         - NODE_ENV=production
         - EMAIL_USER=your-gmail@gmail.com
         - EMAIL_PASS=abcdefghijklmnop
         - FRONTEND_URL=https://icsrt.cloud
         - API_URL=https://api.icsrt.cloud
   ```

2. **Or use .env file** and docker-compose:
   ```bash
   # Create .env file
   echo "EMAIL_USER=your-gmail@gmail.com" >> .env
   echo "EMAIL_PASS=abcdefghijklmnop" >> .env
   ```

3. **Restart containers**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## ✅ Step 3: Test Email Configuration

### Method 1: Check Server Logs

1. **Restart your backend server**

2. **Watch the startup logs**:
   ```bash
   # Look for this message:
   📧 Email configured with: your-gmail@gmail.com
   
   # If you see this instead:
   ❌ CRITICAL: Email credentials not configured in PRODUCTION!
   # → Environment variables not loaded correctly
   ```

### Method 2: Test User Registration

1. **Go to your production website**: https://icsrt.cloud

2. **Register a new test account**:
   - Use a real email you can check
   - Fill in all details
   - Click "Sign Up"

3. **Check email inbox**:
   - ✅ Should receive verification email within 1-2 minutes
   - ❌ If not received:
     - Check spam/junk folder
     - Check server logs for error messages
     - Verify environment variables are set

### Method 3: Check Server Logs for Errors

```bash
# View recent logs
tail -f /var/log/icsrt-backend.log

# Or if using PM2:
pm2 logs icsrt-db

# Look for these patterns:
✅ "Verification email sent successfully"  → Working!
❌ "CRITICAL: Email credentials not configured"  → Not configured
❌ "Authentication failed"  → Wrong password
❌ "Network error"  → Firewall/connectivity issue
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Authentication failed" (EAUTH)
**Cause**: Wrong email or app password  
**Solution**:
- Verify EMAIL_USER is correct Gmail address
- Regenerate app password (might be expired)
- Ensure using app password, NOT regular password
- Check 2FA is enabled on Gmail account

### Issue 2: "Network error" (ENOTFOUND)
**Cause**: Server cannot reach Gmail servers  
**Solution**:
- Check server internet connection
- Verify DNS resolution: `ping smtp.gmail.com`
- Check if firewall blocks Gmail (rare)

### Issue 3: "Connection timeout" (ETIMEDOUT)
**Cause**: Firewall blocking SMTP ports  
**Solution**:
- Ensure ports 587 (TLS) or 465 (SSL) are open
- Check with hosting provider
- Test connection: `telnet smtp.gmail.com 587`

### Issue 4: "Connection refused" (ECONNREFUSED)
**Cause**: SMTP port blocked by firewall  
**Solution**:
- Contact hosting provider to open SMTP ports
- Some shared hosts block SMTP for spam prevention
- May need VPS or dedicated hosting

### Issue 5: Environment variables not loading
**Cause**: .env file not read or variables not exported  
**Solution**:
```bash
# Check if variables are set:
node -e "console.log(process.env.EMAIL_USER)"

# Should output your email
# If empty/undefined:
# 1. Check .env file exists
# 2. Check .env is in same directory as server.js
# 3. Verify dotenv is loaded: require('dotenv').config()
# 4. Check file permissions: chmod 600 .env
```

### Issue 6: Gmail says "Less secure app blocked"
**Cause**: Trying to use regular password instead of app password  
**Solution**:
- DO NOT enable "Less secure app access" (deprecated by Google)
- MUST use App Password with 2FA enabled
- App passwords are the secure, modern way

---

## 🔐 Security Best Practices

### ✅ DO:
- Use dedicated Gmail account for system emails
- Use App Password (never regular password)
- Enable 2FA on Gmail account
- Store passwords in environment variables (not in code)
- Use `.env` files with proper permissions (`chmod 600 .env`)
- Rotate app passwords periodically (every 6-12 months)
- Monitor failed email attempts in logs

### ❌ DON'T:
- Don't use your personal Gmail
- Don't commit .env files to Git
- Don't share app passwords
- Don't enable "Less secure apps" (deprecated)
- Don't hardcode passwords in source code
- Don't use same password for multiple services

---

## 📊 Monitoring Email Health

### Add to Your Monitoring:

1. **Track email send success rate**:
   - Monitor server logs for "✅ email sent" vs "❌ failed to send"
   - Set up alerts if failure rate > 10%

2. **Check Gmail quotas**:
   - Free Gmail: 500 emails/day
   - Google Workspace: 2000 emails/day
   - Monitor your usage

3. **Log rotation**:
   ```bash
   # Prevent logs from filling disk
   # Add to /etc/logrotate.d/icsrt-backend
   /var/log/icsrt-backend.log {
       daily
       rotate 7
       compress
       delaycompress
       missingok
       notifempty
   }
   ```

---

## 🔄 Alternative Email Providers

If Gmail doesn't work on your hosting, try:

### SendGrid (Recommended for production)
```bash
# Install SendGrid SDK
npm install @sendgrid/mail

# Update server.js to use SendGrid API
# No SMTP needed, works on all hosts
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Mailgun
```bash
MAILGUN_API_KEY=your_key
MAILGUN_DOMAIN=mg.yourdomain.com
```

### Amazon SES
```bash
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

### Custom SMTP
```javascript
// Update createEmailTransporter() in server.js:
nodemailer.createTransporter({
  host: 'smtp.yourdomain.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

---

## ✅ Verification Checklist

After configuration, verify:

- [ ] Environment variables set on production server
- [ ] Gmail account has 2FA enabled
- [ ] App password generated and configured
- [ ] Backend server restarted
- [ ] Startup logs show "📧 Email configured"
- [ ] Test registration sends verification email
- [ ] Password reset emails work
- [ ] Emails arrive within 1-2 minutes
- [ ] No errors in server logs
- [ ] Emails not in spam folder

---

## 📞 Need Help?

### Debug Mode:
Set `DEBUG=true` in environment to see detailed logs:
```bash
DEBUG=true node server.js
```

### Check Application Logs:
```bash
# PM2
pm2 logs icsrt-db --lines 100

# Direct Node
node server.js 2>&1 | tee -a server.log

# System logs
tail -f /var/log/syslog | grep icsrt
```

### Still Having Issues?

1. Check this file for error codes: `icsrt-db/server.js` (search for "EAUTH", "ENOTFOUND")
2. Verify all environment variables: `printenv | grep EMAIL`
3. Test SMTP connection: `telnet smtp.gmail.com 587`
4. Contact your hosting support about SMTP access

---

## 📝 Quick Reference

### Environment Variables Needed:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
NODE_ENV=production
FRONTEND_URL=https://icsrt.cloud
API_URL=https://api.icsrt.cloud
```

### Gmail App Password URL:
https://myaccount.google.com/apppasswords

### Test Email Functionality:
1. Register new account → Should receive verification email
2. Request password reset → Should receive reset email
3. Check server logs for confirmation messages

---

**Last Updated**: November 6, 2025  
**Status**: Production email configuration guide complete  
**Next**: Configure and test on your production server

🎉 Once configured, all email features will work perfectly in production!
