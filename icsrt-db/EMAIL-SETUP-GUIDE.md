# Email Configuration Guide for ICSRT

## Current Status
❌ **Email features are NOT working** - emails are only being logged to console

## Why Email Features Don't Work

Your `.env` file has these settings:
```
EMAIL_USER=
EMAIL_PASS=
```

Both are empty, so the system runs in "development mode" where emails are only logged to the console instead of actually being sent.

## Affected Features

When email is not configured, these features WON'T work:
- ❌ User email verification codes (signup)
- ❌ Newsletter subscriptions
- ❌ Password reset emails
- ❌ Service order notifications
- ❌ Any email communication

## Quick Setup (3 Steps)

### Step 1: Get Gmail App Password

1. **Enable 2-Factor Authentication** (required for App Passwords)
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Windows Computer" (or other)
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcdefghijklmnop`)

### Step 2: Configure Email

**Option A: Use Setup Wizard (Recommended)**
```bash
cd icsrt-db
node setup-email.js
```
Follow the prompts to enter your Gmail and App Password.

**Option B: Manual Configuration**

Edit `icsrt-db/.env` file and update these lines:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

Example:
```env
EMAIL_USER=icsrt.system@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

### Step 3: Test & Restart

1. **Test the configuration**:
   ```bash
   cd icsrt-db
   node test-email.js
   ```
   This will verify your email setup and optionally send a test email.

2. **Restart the server**:
   - Stop current server (Ctrl+C)
   - Start again: `node server.js`
   - You should see: `📧 Email configured with: your-email@gmail.com`

## Verification

After setup, you should see in server logs:
```
✅ Email configured with: icsrt.system@gmail.com
```

Instead of:
```
⚠️ Email credentials not configured - using development mode
```

## Testing Email Features

### 1. Test User Signup Verification
1. Go to userpage signup: http://localhost:3002/signup
2. Register a new user
3. Check your email for verification code
4. Enter code to verify account

### 2. Test Newsletter
1. Go to dashboard: http://localhost:3001
2. Navigate to Newsletter section
3. Send a test newsletter
4. Check recipient email

## Troubleshooting

### "Invalid login" error
- ✅ Make sure you're using **App Password**, not your regular Gmail password
- ✅ Verify 2FA is enabled
- ✅ Generate a new App Password if needed

### "Authentication failed"
- ✅ Check EMAIL_USER is correct Gmail address
- ✅ Check EMAIL_PASS has no spaces or quotes
- ✅ Restart server after changing .env

### Emails still not sending
- ✅ Check internet connection
- ✅ Verify Gmail SMTP is not blocked by firewall
- ✅ Check server logs for error messages
- ✅ Run `node test-email.js` to diagnose

## Production Setup

For production deployment, set environment variables on your hosting:

**Hostinger/cPanel**:
1. Go to Advanced → Terminal
2. Edit .env file:
   ```bash
   nano /home/username/icsrt-db/.env
   ```
3. Add EMAIL_USER and EMAIL_PASS
4. Save (Ctrl+X, Y, Enter)
5. Restart Node.js application

**Other Hosting**:
- Set EMAIL_USER and EMAIL_PASS as environment variables
- Make sure they're loaded before starting the server

## Security Notes

⚠️ **Important**:
- Never commit .env file to Git
- Use App Passwords, not your main Gmail password
- Keep EMAIL_PASS secure
- Regenerate App Password if compromised

## Alternative Email Services

If you don't want to use Gmail:

### Using Other SMTP Servers

Edit `server.js` line ~383:
```javascript
return nodemailer.createTransport({
  host: 'smtp.your-provider.com',  // Change this
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass
  }
});
```

### SendGrid / Mailgun / AWS SES
Contact support for integration instructions.

## Support

If you still have issues:
1. Run: `node test-email.js` and send the error output
2. Check server console logs when trying to send email
3. Verify your Gmail account security settings

---

**Need Help?** The email system is fully configured in the code - you just need to add valid credentials to `.env` file!
