# Paymob Integration Setup Guide for ICSRT

## Your Paymob Credentials

You have the following test credentials for Egypt region:
- **API Key (Secret)**: `egy_sk_test_2e9e4e5ecb9102ce8b5280e8a91ddbca8fe22d93f06e61a31bf9ffcd6ff79b19`
- **API Key (Public)**: `egy_pk_test_EkdCVViBy09fzkFx6gOSoaazj81XWVoL`

## Setup Steps

### Step 1: Sign in to Paymob Dashboard

1. Go to: https://accept.paymob.com/
2. Sign in with your account
3. Navigate to **Dashboard**

### Step 2: Get Your Integration IDs

1. Go to **Payment Integrations** section
2. Find your **Wallet** or **Card** integration
3. Copy these values:
   - **Integration ID** (INTEGRATION_ID)
   - **IFrame ID** (IFRAME_ID)

### Step 3: Get HMAC Secret

1. Go to **Developers** → **Security Settings**
2. Find **HMAC Secret** or **Webhook Secret**
3. Copy the secret key

### Step 4: Configure Environment Variables

**For Backend** (`icsrt-db/.env`):

```bash
# Your provided credentials
PAYMOB_API_KEY=egy_sk_test_2e9e4e5ecb9102ce8b5280e8a91ddbca8fe22d93f06e61a31bf9ffcd6ff79b19

# Get these from Paymob Dashboard
PAYMOB_INTEGRATION_ID=your_integration_id_here
PAYMOB_IFRAME_ID=your_iframe_id_here
PAYMOB_HMAC_SECRET=your_hmac_secret_here
```

**For Frontend** (already configured):
- User Page: Create `.env.production` with `REACT_APP_API_BASE_URL=https://api.icsrt.cloud`
- Dashboard: Create `.env.production` with `REACT_APP_API_BASE_URL=https://api.icsrt.cloud`

### Step 5: Set Webhook URL

1. Go to **Developers** → **Webhooks** in Paymob Dashboard
2. Add webhook URL:
   - **Development**: `http://localhost:3000/api/webhooks/payment/paymob`
   - **Production**: `https://api.icsrt.cloud/api/webhooks/payment/paymob`

### Step 6: Configure Payment Methods

1. Go to **Payment Integrations**
2. Enable the payment methods you want:
   - **Wallet** (Vodafone Cash, Etisalat Cash, Orange Money, etc.)
   - **Cards** (Credit/Debit cards)
3. Configure each method according to Paymob documentation

## How It Works

### Payment Flow

1. **User initiates purchase** → Frontend sends request to `/api/user/service-orders/:id/purchase`
2. **Backend authenticates** with Paymob using API_KEY
3. **Backend creates order** on Paymob
4. **Backend generates payment key** with billing info
5. **Backend returns iframe URL** to frontend
6. **Frontend displays iframe** with Paymob payment form
7. **User completes payment** in the iframe
8. **Paymob sends webhook** to your server
9. **Backend updates order status** based on webhook

### IFrame Integration

The payment iframe is displayed using:

```javascript
// In your React component
<iframe 
  src={iframeUrl} 
  title="Paymob Payment"
  style={{ width: '100%', height: '720px', border: 'none' }}
  allow="payment"
/>
```

Where `iframeUrl` comes from the API response after initiating payment.

## Testing

### Test Payment Endpoint

1. Visit: `http://localhost:3002/test-payment` (or `https://icsrt.cloud/test-payment`)
2. Fill in test details:
   - Amount: Any amount in EGP
   - Email: test@example.com
   - Phone: Any Egyptian phone number
3. Click "Start Test Payment"
4. Complete payment in the iframe

### Test Card Details (from Paymob Documentation)

- **Card Number**: 4987654321098769
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

### Test Wallet

- Follow Paymob documentation for wallet testing
- Usually involves scanning QR code or entering phone number

## Production Deployment

### Before Going Live

1. **Switch to Production Credentials**:
   ```bash
   # Get production keys from Paymob Dashboard > Production
   PAYMOB_API_KEY=your_production_api_key
   PAYMOB_INTEGRATION_ID=your_production_integration_id
   PAYMOB_IFRAME_ID=your_production_iframe_id
   PAYMOB_HMAC_SECRET=your_production_hmac_secret
   ```

2. **Update Webhook URL**:
   - Set production webhook: `https://api.icsrt.cloud/api/webhooks/payment/paymob`

3. **Test All Payment Methods**:
   - Test with real small amounts
   - Verify webhooks are received
   - Check order status updates correctly

4. **Configure Security**:
   - Enable HTTPS only
   - Set up HMAC signature verification
   - Implement rate limiting

## Troubleshooting

### Issue: "Invalid API Key"
- **Solution**: Make sure you're using the correct test credentials
- Check that `PAYMOB_API_KEY` is set correctly in `.env`

### Issue: IFrame Not Loading
- **Solution**: Check browser console for CORS errors
- Verify `PAYMOB_IFRAME_ID` is correct
- Ensure HTTPS is used in production

### Issue: Webhook Not Received
- **Solution**: Check webhook URL is correct
- Verify server is publicly accessible
- Check firewall settings
- Test webhook URL manually using curl

### Issue: Payment Completes But Order Not Updated
- **Solution**: Check webhook endpoint logs
- Verify HMAC signature verification
- Check MongoDB connection
- Review server logs for errors

## API Endpoints

### Initiate Payment
```
POST /api/user/service-orders/:id/purchase
```

**Request Body:**
```json
{
  "userEmail": "user@example.com",
  "billingInfo": {
    "fullName": "John Doe",
    "email": "user@example.com",
    "phone": "+201234567890",
    "address": "Cairo, Egypt",
    "city": "Cairo",
    "country": "Egypt"
  },
  "paymentMethod": "paymob"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "iframeUrl": "https://accept.paymob.com/api/acceptance/iframes/...",
    "paymentKey": "...",
    "orderId": "..."
  }
}
```

### Payment Webhook
```
POST /api/webhooks/payment/paymob
```

**Headers:**
- `hmac` or `x-paymob-signature`: HMAC signature from Paymob

**Body:**
- Contains payment status and transaction details from Paymob

## Additional Resources

- **Paymob Documentation**: https://docs.paymob.com/
- **Paymob Dashboard**: https://accept.paymob.com/
- **Egypt Region Support**: Paymob Egypt

## Need Help?

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with Paymob sandbox first
4. Contact Paymob support for credential issues

