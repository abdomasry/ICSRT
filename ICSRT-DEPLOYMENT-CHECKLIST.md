# ICSRT++ Deployment Checklist (Pilot)

This is a minimal, action-oriented checklist to deploy the ICSRT++ stack for a functional pilot. Security hardening can follow later.

## 1) Environments and Ports
- API (icsrt-db)
  - PORT: 3000 (change if needed; keep consistent with frontend ENV)
  - CORS origins: update to your production domains
- Dashboard (icsrt-dashboard)
  - Port: 3001 (dev) or host as static files behind a web server
  - REACT_APP_API_BASE_URL: https://your-api.example.com
- Userpage (icsrt-userpage)
  - Port: 3002 (dev) or host as static files
  - REACT_APP_API_BASE_URL: https://your-api.example.com

Note: If running locally, avoid port conflicts (EADDRINUSE). Only one service can bind to a port at a time.

## 2) Backend .env (icsrt-db/.env)
Required for functional run:
- JWT_SECRET=change_me
- EMAIL_USER=your_gmail@example.com
- EMAIL_PASS=your_app_password
- FRONTEND_URL=https://your-userpage.example.com
- API_URL=https://your-api.example.com
- Optional (override hard-coded Atlas URI):
  - MONGODB_URI=mongodb+srv://<user>:<pass>@cluster/icsrt_main

Payments (Paymob sandbox or live):
- PAYMOB_API_KEY=...
- PAYMOB_INTEGRATION_ID=...
- PAYMOB_IFRAME_ID=...
- PAYMOB_HMAC_SECRET=...

## 3) CORS and Origins
Update allowed origins in `icsrt-db/server.js` to include your production domains (dashboard and userpage). Example:
- https://dashboard.example.com
- https://www.example.com (userpage)

## 4) Paymob Webhook
- Endpoint: POST https://your-api.example.com/api/webhooks/payment/paymob
- Set this URL in Paymob Dashboard > Developers > Webhooks.
- Ensure HTTPS and that your server is reachable from Paymob.
- Test with sandbox; verify invoices change status from pending -> completed/failed.

## 5) WhatsApp (whatsapp-web.js)
- First run requires scanning the QR from Dashboard > Service Orders Conversation tab.
- Session persists in server working dir (.wwebjs_auth). Use a stable path/persistent disk.
- On Linux servers, install Chromium dependencies; on Windows, headless mode generally works.
- Outbound phone numbers must be in international format; Egypt defaults applied (+20...).

## 6) Email Delivery
- Uses Gmail via Nodemailer. Set an App Password and allow SMTP.
- For production deliverability, configure SPF/DKIM/DMARC on your domain if you use a domain mailbox.

## 7) Builds and Run (Windows quick start)
- Backend (API)
  - Install: npm install
  - Run: node server.js (consider pm2/NSSM for service mode)
- Dashboard (admin)
  - Set REACT_APP_API_BASE_URL; build with `npm run build` and host the `build` folder (IIS/Nginx/Netlify/etc.)
- Userpage (client)
  - Set REACT_APP_API_BASE_URL; build with `npm run build` and host the `build` folder

## 8) Functional Validation (smoke tests)
- API health: GET /api/health -> { status: "healthy" }
- Dashboard login and Service Orders list load
- WhatsApp panel: Start/Re-init, show QR, scan, send a test message to +20... number
- Email send from dashboard (notify) -> verify mailbox receives
- Coupon create/apply on user order
- Purchase initiate -> Paymob iframe opens (sandbox) -> complete test payment -> webhook updates order/payment statuses

## 9) Known Gaps (acceptable for pilot)
- Admin/backend auth is basic; secure endpoints and roles later.
- MONGODB_URI is hard-coded in code; you can override via ENV now, but move to ENV-only later.
- CORS currently lists localhost; ensure you add your domains pre-deploy.
- Logging goes to console; add structured logs/rotation later.

## 10) Quick Troubleshooting
- Port in use (EADDRINUSE 3000): stop the other process or change PORT.
  - PowerShell: `$env:PORT=3003; node server.js`
- WhatsApp not sending: ensure target number is a WhatsApp account and shows as +20..., re-init and re-scan QR.
- Paymob iframe null: missing sandbox creds or network blocks; check server logs and Paymob dashboard.
- Email not sent: bad Gmail creds or SMTP blocked; check transporter verification logs.

---
This checklist gets you to a working pilot. For production, plan security hardening (auth, secrets, rate limits), monitoring, and backups.
