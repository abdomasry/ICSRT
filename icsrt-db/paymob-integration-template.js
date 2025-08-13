// Paymob Integration Template for ICSRT++ Purchase System
// This file provides the structure for integrating with Paymob API

const axios = require('axios');

class PaymobIntegration {
  constructor() {
    // Paymob API configuration (to be filled with real values)
    this.config = {
      API_KEY: process.env.PAYMOB_API_KEY || 'your_paymob_api_key',
  AUTH_TOKEN: process.env.PAYMOB_AUTH_TOKEN || '',
      INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID || 'your_integration_id',
      IFRAME_ID: process.env.PAYMOB_IFRAME_ID || 'your_iframe_id',
      HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET || 'your_hmac_secret',
      BASE_URL: 'https://accept.paymob.com/api'
    };
  }

  /**
   * Step 1: Authenticate with Paymob and get auth token
   */
  async authenticate() {
    try {
      // If an auth token is provided directly (from dashboard), use it
      if (this.config.AUTH_TOKEN && this.config.AUTH_TOKEN.length > 0) {
        return this.config.AUTH_TOKEN;
      }
      const response = await axios.post(`${this.config.BASE_URL}/auth/tokens`, {
        api_key: this.config.API_KEY
      });
      
      return response.data.token;
    } catch (error) {
      console.error('Paymob authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Paymob');
    }
  }

  /**
   * Step 2: Create order on Paymob
   */
  async createOrder(authToken, orderData) {
    try {
      const paymobOrder = {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: Math.round(orderData.amount * 100), // Convert to cents
        currency: orderData.currency || 'EGP',
        items: [
          {
            name: orderData.serviceName,
            amount_cents: Math.round(orderData.amount * 100),
            description: `ICSRT Service: ${orderData.serviceName}`,
            quantity: 1
          }
        ]
      };

      const response = await axios.post(`${this.config.BASE_URL}/ecommerce/orders`, paymobOrder);
      return response.data;
    } catch (error) {
      console.error('Paymob order creation failed:', error.response?.data || error.message);
      throw new Error('Failed to create order on Paymob');
    }
  }

  /**
   * Step 3: Generate payment key
   */
  async generatePaymentKey(authToken, orderId, billingInfo, amount) {
    try {
      const paymentKeyData = {
        auth_token: authToken,
        amount_cents: Math.round(amount * 100),
        expiration: 3600, // 1 hour
        order_id: orderId,
        billing_data: {
          apartment: "NA",
          email: billingInfo.email,
          floor: "NA",
          first_name: billingInfo.fullName.split(' ')[0] || 'Customer',
          street: billingInfo.address || 'NA',
          building: "NA",
          phone_number: billingInfo.phone,
          shipping_method: "NA",
          postal_code: "NA",
          city: billingInfo.city || 'NA',
          country: billingInfo.country || 'NA',
          last_name: billingInfo.fullName.split(' ').slice(1).join(' ') || 'Customer',
          state: "NA"
        },
        currency: "EGP",
        integration_id: this.config.INTEGRATION_ID
      };

      const response = await axios.post(`${this.config.BASE_URL}/acceptance/payment_keys`, paymentKeyData);
      return response.data.token;
    } catch (error) {
      console.error('Payment key generation failed:', error.response?.data || error.message);
      throw new Error('Failed to generate payment key');
    }
  }

  /**
   * Generate iframe URL for payment
   */
  generateIframeUrl(paymentKey) {
    return `https://accept.paymob.com/api/acceptance/iframes/${this.config.IFRAME_ID}?payment_token=${paymentKey}`;
  }

  /**
   * Complete payment flow - to be called from purchase API
   */
  async initiatePayment(orderData, billingInfo) {
    try {
      console.log('🔐 Authenticating with Paymob...');
      const authToken = await this.authenticate();

      console.log('📋 Creating order on Paymob...');
      const paymobOrder = await this.createOrder(authToken, orderData);

      console.log('🔑 Generating payment key...');
      const paymentKey = await this.generatePaymentKey(
        authToken, 
        paymobOrder.id, 
        billingInfo, 
        orderData.amount
      );

      console.log('🌐 Generating iframe URL...');
      const iframeUrl = this.generateIframeUrl(paymentKey);

      return {
        success: true,
        authToken,
        orderId: paymobOrder.id,
        paymentKey,
        iframeUrl,
        paymobOrderData: paymobOrder
      };
    } catch (error) {
      console.error('Payment initiation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify webhook signature from Paymob
   */
  verifyWebhookSignature(webhookData, receivedSignature) {
    const crypto = require('crypto');
    
    // Paymob webhook signature verification
    const concatenatedString = [
      webhookData.amount_cents,
      webhookData.created_at,
      webhookData.currency,
      webhookData.error_occured,
      webhookData.has_parent_transaction,
      webhookData.id,
      webhookData.integration_id,
      webhookData.is_3d_secure,
      webhookData.is_auth,
      webhookData.is_capture,
      webhookData.is_refunded,
      webhookData.is_standalone_payment,
      webhookData.is_voided,
      webhookData.order,
      webhookData.owner,
      webhookData.pending,
      webhookData.source_data_pan,
      webhookData.source_data_sub_type,
      webhookData.source_data_type,
      webhookData.success
    ].join('');

    const expectedSignature = crypto
      .createHmac('sha512', this.config.HMAC_SECRET)
      .update(concatenatedString)
      .digest('hex');

    return expectedSignature === receivedSignature;
  }

  /**
   * Process webhook data
   */
  processWebhook(webhookData) {
    return {
      transactionId: webhookData.id,
      orderId: webhookData.order,
      success: webhookData.success,
      amount: webhookData.amount_cents / 100,
      currency: webhookData.currency,
      errorOccurred: webhookData.error_occured,
      isPending: webhookData.pending,
      isRefunded: webhookData.is_refunded,
      createdAt: webhookData.created_at,
      sourceData: {
        type: webhookData.source_data_type,
        subType: webhookData.source_data_sub_type,
        pan: webhookData.source_data_pan
      }
    };
  }
}

module.exports = PaymobIntegration;

/*
=== INTEGRATION INSTRUCTIONS ===

1. Install required dependencies:
   npm install axios crypto

2. Set environment variables:
   PAYMOB_API_KEY=your_api_key_from_paymob_dashboard
   PAYMOB_INTEGRATION_ID=your_integration_id
   PAYMOB_IFRAME_ID=your_iframe_id  
   PAYMOB_HMAC_SECRET=your_hmac_secret

3. Update service-order-purchase-api.js:
   - Import: const PaymobIntegration = require('./paymob-integration');
   - Initialize: const paymob = new PaymobIntegration();
   - Use in purchase endpoint to get iframe URL
   - Update webhook endpoint to use signature verification

4. Frontend integration:
   - Display iframe URL in modal/new window
   - Handle payment completion redirect
   - Update order status based on webhook response

5. Testing:
   - Use Paymob sandbox credentials for testing
   - Test with different payment methods
   - Verify webhook signature validation
   - Test payment success/failure scenarios

=== PAYMOB DASHBOARD SETUP ===

1. Create account at: https://accept.paymob.com/
2. Get API credentials from Dashboard > Developers
3. Setup webhook URL: https://yourdomain.com/api/webhooks/payment/paymob
4. Configure payment methods (cards, wallets, etc.)
5. Test in sandbox mode before going live

=== SECURITY CONSIDERATIONS ===

- Store API keys securely in environment variables
- Validate all webhook signatures
- Implement rate limiting on payment endpoints
- Log all payment transactions for audit
- Handle PCI compliance requirements
- Use HTTPS for all payment communications

*/
