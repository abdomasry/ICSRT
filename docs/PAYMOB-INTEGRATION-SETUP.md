# Paymob Payment Integration Setup Guide

## ✅ Configuration Complete

Your Paymob payment integration has been configured with the following credentials:

### API Credentials
- **API Key**: `egy_sk_test_2e9e4e5ecb9102ce8b5280e8a91ddbca8fe22d93f06e61a31bf9ffcd6ff79b19`
- **Public Key**: `egy_pk_test_EkdCVViBy09fzkFx6gOSoaazj81XWVoL`
- **Auth Token**: Configured (Base64 encoded)

### Integration IDs
- **Card Payment Integration**: `5232435` (paymob)
- **Wallet Payment Integration**: `5232441` (wallet)

### Callback URLs
Both integrations configured with:
- **Transaction Processed Callback**: `https://accept.paymobsolutions.com/api/acceptance/post_pay`
- **Transaction Response Callback**: `https://accept.paymobsolutions.com/api/acceptance/post_pay`

---

## 📋 Next Steps to Complete Integration

### 1. Get Missing Credentials from Paymob Dashboard

You still need to get these from your Paymob Dashboard:

1. **Login to Paymob**: https://accept.paymob.com/
2. **Get IFRAME_ID**:
   - Go to: **Settings** → **Payment Integrations**
   - Find your integration (paymob or wallet)
   - Copy the **Iframe ID**
   - Add to `.env`: `PAYMOB_IFRAME_ID=your_iframe_id_here`

3. **Get HMAC_SECRET**:
   - Go to: **Developers** → **Security Settings**
   - Copy the **HMAC Secret**
   - Add to `.env`: `PAYMOB_HMAC_SECRET=your_hmac_secret_here`

### 2. Update Your Callback URLs (IMPORTANT FOR PRODUCTION)

Currently your callbacks point to Paymob's default URL. You need to update them:

1. In Paymob Dashboard, go to **Settings** → **Payment Integrations**
2. Edit integration **5232435** (card) and **5232441** (wallet)
3. Update callbacks to your domain:
   ```
   Transaction Processed Callback: https://api.icsrt.cloud/api/webhooks/paymob
   Transaction Response Callback: https://api.icsrt.cloud/api/webhooks/paymob
   ```
   
   For local testing:
   ```
   http://localhost:3000/api/webhooks/paymob
   ```

### 3. Test the Integration

The Paymob integration class is ready at: `icsrt-db/paymob-integration.js`

Test it with this example:

```javascript
const PaymobIntegration = require('./paymob-integration');
const paymob = new PaymobIntegration();

// Test payment initiation
const testOrder = {
  amount: 100,
  currency: 'EGP',
  serviceName: 'Test Service',
  orderNumber: 'TEST-001'
};

const testBilling = {
  fullName: 'Test Customer',
  email: 'test@example.com',
  phone: '+201000000000',
  city: 'Cairo',
  country: 'EG'
};

paymob.initiatePayment(testOrder, testBilling, 'card')
  .then(result => {
    console.log('Payment URL:', result.iframeUrl);
  });
```

---

## 🔌 Integration with Existing System

### The integration file provides:

1. **Payment Initiation**: `initiatePayment(orderData, billingInfo, paymentMethod)`
   - Authenticates with Paymob
   - Creates order
   - Generates payment key
   - Returns iframe URL for payment

2. **Webhook Processing**: `processWebhook(webhookData)`
   - Verifies webhook signature
   - Extracts payment information
   - Returns structured payment result

3. **Signature Verification**: `verifyWebhookSignature(webhookData, signature)`
   - Validates Paymob webhook authenticity
   - Uses HMAC SHA-512

### Payment Methods Supported:
- **Card**: Credit/Debit cards (Integration ID: 5232435)
- **Wallet**: Mobile wallets (Integration ID: 5232441)

---

## 🚀 How Customers Will Pay

1. **Customer selects service** on your userpage
2. **System generates purchase link**  
3. **Customer clicks "Pay Now"**
4. **System calls Paymob integration**:
   ```javascript
   const payment = await paymob.initiatePayment(orderData, billingInfo, 'card');
   ```
5. **Customer redirected to Paymob iframe** with payment form
6. **Customer completes payment**
7. **Paymob sends webhook** to your callback URL
8. **System updates order status** based on webhook

---

## 📁 Files Modified

1. **`.env`** - Added Paymob credentials
2. **`paymob-integration.js`** - Payment integration class
3. **`paymob-integration-template.js`** - Original template (keep as reference)

---

## 🔒 Security Notes

✅ **Current Setup**:
- API keys stored in `.env` (not in code)
- Auth token encoded
- Test mode credentials (safe for development)

⚠️ **Before Production**:
1. Get production API keys from Paymob
2. Update `.env` with production credentials
3. **NEVER commit `.env` to git**
4. Configure HMAC secret for webhook verification
5. Use HTTPS for all payment communications
6. Test thoroughly in sandbox first

---

## 📞 Paymob Support

- **Dashboard**: https://accept.paymob.com/
- **Documentation**: https://docs.paymob.com/
- **Support Email**: support@paymob.com
- **Test Cards**: Available in Paymob documentation

---

## ✅ Current Status

| Item | Status |
|------|--------|
| API Key | ✅ Configured |
| Public Key | ✅ Configured |
| Auth Token | ✅ Configured |
| Card Integration ID | ✅ Configured (5232435) |
| Wallet Integration ID | ✅ Configured (5232441) |
| Integration Class | ✅ Created |
| Iframe ID | ⚠️ **Needed from Dashboard** |
| HMAC Secret | ⚠️ **Needed from Dashboard** |
| Callback URLs | ⚠️ **Need to update to your domain** |
| Backend Endpoints | ⏳ Ready to implement |
| Frontend UI | ⏳ Ready to implement |

---

## 🎯 Next Development Steps

1. **Get missing credentials** (Iframe ID & HMAC Secret)
2. **Integrate with purchase API** (service-order-purchase-api.js)
3. **Create webhook endpoint** (/api/webhooks/paymob)
4. **Add payment button** to userpage
5. **Test with Paymob test cards**
6. **Go live** with production credentials

---

**Last Updated**: November 6, 2025
**Integration Status**: Configuration Complete - Ready for Iframe ID & HMAC Secret
