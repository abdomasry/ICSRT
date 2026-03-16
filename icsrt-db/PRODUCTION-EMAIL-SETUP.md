# Production Email Setup Guide for ICSRT

## Problem
Email features don't work in production because `.env` file is not uploaded to the server or environment variables are not set.

## Solutions for Production

### Option 1: Set Environment Variables on Hostinger (Recommended)

#### Via File Manager:
1. Login to Hostinger cPanel
2. Go to **File Manager**
3. Navigate to `/home/username/icsrt-db/`
4. Edit `.env` file (or create if doesn't exist)
5. Add these lines:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```
6. Save the file
7. Restart Node.js application

#### Via SSH Terminal:
1. Login to Hostinger SSH
2. Run these commands:
   ```bash
   cd ~/icsrt-db
   nano .env
   ```
3. Add or update:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```
4. Save (Ctrl+X, Y, Enter)
5. Restart application:
   ```bash
   pm2 restart icsrt-backend
   # or
   pkill node
   node server.js &
   ```

### Option 2: Use Node.js App Environment Variables

If your hosting provider has a Node.js app manager:

1. Go to **Node.js App Manager** in cPanel
2. Click on your ICSRT application
3. Find **Environment Variables** section
4. Add:
   - `EMAIL_USER` = `your-email@gmail.com`
   - `EMAIL_PASS` = `your-16-char-app-password`
5. Save and restart application

### Option 3: Create Production .env File

Create a separate `.env.production` file that you upload manually:

1. Create `icsrt-db/.env.production` locally:
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your-production-mongodb-uri
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   JWT_SECRET=your-production-secret
   PAYMOB_API_KEY=your-production-key
   ```

2. Upload this file to server via FTP/SFTP
3. Rename it to `.env` on the server
4. Restart Node.js application

### Option 4: Set Variables in server.js (NOT Recommended for Security)

Only use this for testing. Edit `server.js` directly on production:

```javascript
// At the top of server.js, after require('dotenv').config();
if (process.env.NODE_ENV === 'production' && !process.env.EMAIL_USER) {
  process.env.EMAIL_USER = 'your-email@gmail.com';
  process.env.EMAIL_PASS = 'your-app-password';
}
```

⚠️ **Not recommended**: Credentials in code can be exposed if code is shared.

## Verification

After setting up, check server logs for:

✅ **Success**:
```
📧 Email configured with: your-email@gmail.com
✅ Email transporter verified for user@example.com
```

❌ **Still Not Configured**:
```
⚠️ Email credentials not configured - using development mode
```

## Testing in Production

### Method 1: Via Browser Console

1. Open production site: `https://icsrt.cloud`
2. Try to signup with a real email
3. Check if verification email arrives
4. Check server logs for email sending confirmation

### Method 2: Via API Test

```bash
# Test email endpoint directly
curl -X POST https://admin.icsrt.cloud/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "fullName": "Test User"
  }'
```

Check the email inbox for verification code.

### Method 3: Check Server Logs

SSH into server and check logs:
```bash
# If using PM2
pm2 logs icsrt-backend

# If using node directly
tail -f ~/icsrt-db/logs/app.log

# Or check console output
ps aux | grep node
```

Look for email-related messages.

## Common Production Issues

### Issue 1: .env file not loaded
**Symptom**: Server logs show "Email credentials not configured"

**Solution**:
- Verify `.env` file exists in production
- Check file permissions: `chmod 644 .env`
- Ensure `dotenv` package is installed: `npm install dotenv`
- Verify `require('dotenv').config()` is at top of server.js

### Issue 2: Environment variables not persisting
**Symptom**: Variables work after manual set but reset after server restart

**Solution**:
- Add variables to `.env` file, not just terminal
- If using PM2, use: `pm2 restart icsrt-backend --update-env`
- Check if hosting provider has environment variable UI

### Issue 3: Gmail blocks login from server
**Symptom**: "Invalid login" error in production but works locally

**Solution**:
- Use App Password, not regular password
- Check if server IP is blocked by Google
- Try from different email provider (SendGrid, Mailgun)
- Enable "Less secure app access" (not recommended)

### Issue 4: SMTP port blocked
**Symptom**: Connection timeout errors

**Solution**:
- Check if port 587 or 465 is open
- Try alternate SMTP port (2525)
- Contact hosting provider to unblock SMTP ports
- Use hosting provider's SMTP relay

## Alternative: Use Hosting Provider's SMTP

Many hosting providers offer SMTP relay. Example for Hostinger:

```javascript
// In server.js, modify createEmailTransporter:
return nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'noreply@yourdomain.com',
    pass: process.env.EMAIL_PASS || 'your-email-password'
  }
});
```

## Security Checklist

- [ ] `.env` file is NOT in Git repository
- [ ] `.env` is listed in `.gitignore`
- [ ] Using App Password instead of real Gmail password
- [ ] File permissions are restrictive (`chmod 600 .env`)
- [ ] Environment variables are set on server
- [ ] Verified email sending works in production
- [ ] Monitoring email delivery rates

## Support

If still not working after trying all solutions:

1. **Check server logs** for specific error messages
2. **Run test email script** on production server:
   ```bash
   cd ~/icsrt-db
   node test-email.js
   ```
3. **Contact hosting support** to ensure SMTP is allowed
4. **Consider alternative email service** (SendGrid, AWS SES, Mailgun)

---

**Quick Command to Set on Production Server:**

```bash
cd ~/icsrt-db
echo 'EMAIL_USER=your-email@gmail.com' >> .env
echo 'EMAIL_PASS=your-app-password' >> .env
pm2 restart icsrt-backend
```

**Verify it worked:**
```bash
pm2 logs icsrt-backend | grep "Email configured"
```

Should show: `📧 Email configured with: your-email@gmail.com`
