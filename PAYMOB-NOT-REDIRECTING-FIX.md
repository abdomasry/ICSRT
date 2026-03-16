# Paymob Not Redirecting - Issue & Solution

## ❌ Current Issue

When you try to buy a service, you're not being redirected to the Paymob payment page.

## 🔍 Root Cause

You are **missing 2 critical credentials** from your Paymob Dashboard:

1. **IFRAME_ID** - Required to generate the payment page URL
2. **HMAC_SECRET** - Required for webhook signature verification

Without the IFRAME_ID, the system cannot create a valid Paymob payment URL.

## ✅ Solution: Get Missing Credentials

### Step 1: Login to Paymob Dashboard
Go to: https://accept.paymob.com/

### Step 2: Get IFRAME_ID

1. In dashboard, click **Settings** → **Payment Integrations**
2. You should see your integrations:
   - **paymob** (Integration ID: 5232435)
   - **wallet** (Integration ID: 5232441)
3. Click on **paymob** integration
4. Look for **"Iframe ID"** field
5. Copy the Iframe ID (it looks like a number, e.g., `123456`)

### Step 3: Get HMAC_SECRET

1. In dashboard, go to **Developers** → **Security Settings**
2. Find **HMAC Secret** or **Transaction Secret**
3. Copy the secret (it's a long string)

### Step 4: Update .env File

Open: `icsrt-db/.env`

Find these lines and update them:

```env
# Replace with your actual values
PAYMOB_IFRAME_ID=your_iframe_id_here
PAYMOB_HMAC_SECRET=your_hmac_secret_here
```

Example (with fake values):
```env
PAYMOB_IFRAME_ID=123456
PAYMOB_HMAC_SECRET=F7A3D8B9C2E1F4A6D5B8C3E9F1A4D7B2
```

### Step 5: Restart Backend

After updating `.env`, restart your backend server:

**Option A - If running in terminal**:
- Press `Ctrl+C` to stop
- Run: `node server.js`

**Option B - If running via batch file**:
- Close the terminal
- Run `start-backend-server.bat` again

## 🧪 Test the Payment Flow

After restarting:

1. Go to your userpage: http://localhost:3002
2. Login with test account
3. Go to a service order
4. Click "Pay Now" or purchase button
5. You should now be **redirected to Paymob payment page**!

## 📌 Note About Localhost

**Localhost works fine!** You don't need a real domain to test Paymob. The integration works perfectly on:
- http://localhost:3000 (backend)
- http://localhost:3002 (userpage)

Paymob's test mode allows local testing.

## 🔄 What Happens After Fix

1. **Customer clicks "Pay Now"**
2. **Backend creates Paymob order**
3. **Backend generates payment key with your IFRAME_ID**
4. **Customer redirected to**: `https://accept.paymob.com/api/acceptance/iframes/YOUR_IFRAME_ID?payment_token=...`
5. **Customer sees real Paymob payment form**
6. **Customer can test with Paymob test cards**
7. **Webhook notifies your backend when payment completes**

## 🎴 Paymob Test Cards

Once working, you can test payments with these test cards:

| Card Number | Expiry | CVV | Result |
|------------|--------|-----|--------|
| 4987654321098769 | Any future | 123 | Success |
| 5123456789012346 | Any future | 123 | Success |

## ⚠️ If Still Not Working

Check browser console for errors:
1. Press `F12` in browser
2. Go to **Console** tab
3. Try purchasing again
4. Share any error messages

Also check backend terminal for Paymob errors:
- Look for `❌ Paymob...` error messages
- Look for `⚠️ IFRAME_ID not set` warnings

---

**Updated**: November 6, 2025
**Status**: Waiting for IFRAME_ID and HMAC_SECRET from Paymob Dashboard
