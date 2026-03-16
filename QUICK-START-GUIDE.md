# Quick Start Guide for ICSRT with Paymob

## 🚀 Environment Files Created

I've automatically created these files for you:
- ✅ `icsrt-db/.env` - Backend environment
- ✅ `icsrt-dashboard/.env.production` - Dashboard production config
- ✅ `icsrt-userpage/.env.production` - User page production config

## 📝 Complete Your Setup

### Step 1: Paymob Credentials

**You have these credentials:**
- ✅ API Key (Secret): `egy_sk_test_2e9e4e5ecb9102ce8b5280e8a91ddbca8fe22d93f06e61a31bf9ffcd6ff79b19`
- ✅ API Key (Public): `egy_pk_test_EkdCVViBy09fzkFx6gOSoaazj81XWVoL`

**You still need from Paymob Dashboard:**
1. **INTEGRATION_ID** - Get from: Dashboard > Payment Integrations
2. **IFRAME_ID** - Get from: Dashboard > Payment Integrations  
3. **HMAC_SECRET** - Get from: Dashboard > Developers > Security Settings

### Step 2: Edit icsrt-db/.env

Open `icsrt-db/.env` and update:

```bash
PAYMOB_INTEGRATION_ID=your_integration_id_here  # Replace this
PAYMOB_IFRAME_ID=your_iframe_id_here            # Replace this
PAYMOB_HMAC_SECRET=your_hmac_secret_here         # Replace this
```

### Step 3: Get Missing Credentials from Paymob

1. **Sign in**: https://accept.paymob.com/
2. **Go to Payment Integrations**
3. **Find your Wallet integration**
4. **Copy Integration ID and IFrame ID**
5. **Go to Developers > Security Settings**
6. **Copy HMAC Secret**

### Step 4: Start Development

```bash
# Terminal 1: Backend
cd icsrt-db
npm install
node server.js

# Terminal 2: Dashboard
cd icsrt-dashboard
npm install
npm start

# Terminal 3: User Page
cd icsrt-userpage
npm install
npm start
```

### Step 5: Test Paymob Payment

1. Visit: `http://localhost:3002/test-payment`
2. Fill in test details
3. Click "Start Test Payment"
4. Complete payment in iframe

## 🎯 Production Deployment

### For https://icsrt.cloud (User Page)
```bash
cd icsrt-userpage
npm run build
# Upload build/ contents to Hostinger
```

### For https://admin.icsrt.cloud (Dashboard)
```bash
cd icsrt-dashboard  
npm run build
# Upload build/ contents to Hostinger
```

### For https://api.icsrt.cloud (Backend)
```bash
cd icsrt-db
# Set NODE_ENV=production
npm install --production
pm2 start server.js --name icsrt-api
```

## 📚 Full Guides

- **Paymob Setup**: See `PAYMOB-SETUP-GUIDE.md`
- **Deployment**: See `HOSTINGER-DEPLOYMENT-GUIDE.md`
- **Verification**: See `DEPLOYMENT-VERIFICATION.md`

## 🔑 Your Paymob Keys Summary

```bash
# Already configured in icsrt-db/.env
PAYMOB_API_KEY=egy_sk_test_2e9e4e5ecb9102ce8b5280e8a91ddbca8fe22d93f06e61a31bf9ffcd6ff79b19
```

**Still needed (get from Paymob Dashboard):**
- INTEGRATION_ID
- IFRAME_ID
- HMAC_SECRET

## ⚡ Quick Test

```bash
# Test if backend is running
curl http://localhost:3000/api/health

# Test Paymob payment
curl -X POST http://localhost:3000/api/payments/test-initiate \
  -H "Content-Type: application/json" \
  -d '{"amount":10,"currency":"EGP"}'
```

## 🆘 Need Help?

- Check `PAYMOB-SETUP-GUIDE.md` for detailed setup
- Check server logs: `cd icsrt-db && npm start`
- Check browser console for frontend errors
- Verify all environment variables are set

## ✨ What's Ready

✅ Environment files created  
✅ Paymob test credentials configured  
✅ API endpoints ready  
✅ IFrame integration ready  
✅ Webhook handling ready

**Next**: Get INTEGRATION_ID, IFRAME_ID, and HMAC_SECRET from Paymob Dashboard!


