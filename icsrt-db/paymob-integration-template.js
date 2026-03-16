// Paymob Integration for ICSRT++ Purchase System
// Updated with your actual credentials

const axios = require('axios');
const crypto = require('crypto');

class PaymobIntegration {
  constructor() {
    // Paymob API configuration (Egypt Region - Test Credentials)
    this.config = {
      API_KEY: process.env.PAYMOB_API_KEY || 'egy_sk_test_2e9e4e5ecb9102ce8b5280e8a91ddbca8fe22d93f06e61a31bf9ffcd6ff79b19',
      PUBLIC_KEY: process.env.PAYMOB_PUBLIC_KEY || 'egy_pk_test_EkdCVViBy09fzkFx6gOSoaazj81XWVoL',
      AUTH_TOKEN: process.env.PAYMOB_AUTH_TOKEN || 'ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBMk56VTFOU3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS53V2NQTmhpV2tDMXE0NEZvT0R1U3c5aVpHOE9zS2JKS19MNWoxV2pST0cxWUh0dDlyLVMxOFFUMTRMemgxWXFnX29aMFVqQVhpZ2EwQkZNSThZVXFIQQ==',
      INTEGRATION_ID_CARD: process.env.PAYMOB_INTEGRATION_ID_CARD || '5232435',
      INTEGRATION_ID_WALLET: process.env.PAYMOB_INTEGRATION_ID_WALLET || '5232441',
      IFRAME_ID: process.env.PAYMOB_IFRAME_ID || '',
      HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET || '',
      BASE_URL: 'https://accept.paymob.com/api'
    };
    
    console.log('✅ Paymob Integration initialized');
    console.log('📍 Region: Egypt (egy)');
    console.log('🔑 API Key: Test mode');
    console.log('💳 Card Integration ID:', this.config.INTEGRATION_ID_CARD);
    console.log('📱 Wallet Integration ID:', this.config.INTEGRATION_ID_WALLET);
  }

  /**
   * Step 1: Authenticate with Paymob (using provided auth token)
   */
  async authenticate() {
    try {
      // Use the provided auth token directly
      if (this.config.AUTH_TOKEN && this.config.AUTH_TOKEN.length > 0) {
        return this.config.AUTH_TOKEN;
      }
      
      // Fallback: authenticate with API key
      const response = await axios.post(`${this.config.BASE_URL}/auth/tokens`, {
        api_key: this.config.API_KEY
      });
      
      return response.data.token;
    } catch (error) {
      console.error('❌ Paymob authentication failed:', error.response?.data || error.message);
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
            name: orderData.serviceName || 'ICSRT Service',
            amount_cents: Math.round(orderData.amount * 100),
            description: `ICSRT Service Order: ${orderData.orderNumber || 'N/A'}`,
            quantity: 1
          }
        ],
        merchant_order_id: orderData.orderNumber || null
      };

      console.log('📋 Creating Paymob order:', paymobOrder);
      const response = await axios.post(`${this.config.BASE_URL}/ecommerce/orders`, paymobOrder);
      console.log('✅ Paymob order created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Paymob order creation failed:', error.response?.data || error.message);
      throw new Error('Failed to create order on Paymob');
    }
  }

  /**
   * Step 3: Generate payment key
   */
  async generatePaymentKey(authToken, orderId, billingInfo, amount, paymentMethod = 'card') {
    try {
      // Choose integration ID based on payment method
      const integrationId = paymentMethod === 'wallet' 
        ? this.config.INTEGRATION_ID_WALLET 
        : this.config.INTEGRATION_ID_CARD;

      const paymentKeyData = {
        auth_token: authToken,
        amount_cents: Math.round(amount * 100),
        expiration: 3600, // 1 hour
        order_id: orderId,
        billing_data: {
          apartment: "NA",
          email: billingInfo.email || 'customer@icsrt.com',
          floor: "NA",
          first_name: (billingInfo.fullName || billingInfo.name || 'Customer').split(' ')[0],
          street: billingInfo.address || 'NA',
          building: "NA",
          phone_number: billingInfo.phone || '+201000000000',
          shipping_method: "NA",
          postal_code: "NA",
          city: billingInfo.city || 'Cairo',
          country: billingInfo.country || 'EG',
          last_name: (billingInfo.fullName || billingInfo.name || 'Customer').split(' ').slice(1).join(' ') || 'Customer',
          state: "NA"
        },
        currency: "EGP",
        integration_id: parseInt(integrationId)
      };

      console.log('🔑 Generating payment key for integration:', integrationId);
      const response = await axios.post(`${this.config.BASE_URL}/acceptance/payment_keys`, paymentKeyData);
      console.log('✅ Payment key generated');
      return response.data.token;
    } catch (error) {
      console.error('❌ Payment key generation failed:', error.response?.data || error.message);
      throw new Error('Failed to generate payment key');
    }
  }

  /**
   * Generate iframe URL for payment
   */
  generateIframeUrl(paymentKey) {
    if (!this.config.IFRAME_ID) {
      console.warn('⚠️  IFRAME_ID not set, using default payment page');
      return `https://accept.paymob.com/api/acceptance/iframes/${paymentKey}`;
    }
    return `https://accept.paymob.com/api/acceptance/iframes/${this.config.IFRAME_ID}?payment_token=${paymentKey}`;
  }

  /**
   * Complete payment flow - to be called from purchase API
   */
  async initiatePayment(orderData, billingInfo, paymentMethod = 'card') {
    try {
      console.log('� Initiating Paymob payment...');
      console.log('💰 Amount:', orderData.amount, orderData.currency || 'EGP');
      console.log('💳 Payment method:', paymentMethod);

      console.log('🔐 Step 1: Authenticating...');
      const authToken = await this.authenticate();

      console.log('📋 Step 2: Creating order...');
      const paymobOrder = await this.createOrder(authToken, orderData);

      console.log('🔑 Step 3: Generating payment key...');
      const paymentKey = await this.generatePaymentKey(
        authToken, 
        paymobOrder.id, 
        billingInfo, 
        orderData.amount,
        paymentMethod
      );

      console.log('🌐 Step 4: Generating iframe URL...');
      const iframeUrl = this.generateIframeUrl(paymentKey);

      console.log('✅ Payment initiated successfully');
      return {
        success: true,
        authToken,
        paymobOrderId: paymobOrder.id,
        paymentKey,
        iframeUrl,
        integrationId: paymentMethod === 'wallet' ? this.config.INTEGRATION_ID_WALLET : this.config.INTEGRATION_ID_CARD
      };
    } catch (error) {
      console.error('❌ Payment initiation failed:', error);
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
    if (!this.config.HMAC_SECRET) {
      console.warn('⚠️  HMAC_SECRET not configured, skipping signature verification');
      return true; // Skip verification in development
    }

    try {
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
    } catch (error) {
      console.error('❌ Signature verification error:', error);
      return false;
    }
  }

  /**
   * Process webhook data
   */
  processWebhook(webhookData) {
    return {
      transactionId: webhookData.id,
      orderId: webhookData.order?.id || webhookData.order,
      merchantOrderId: webhookData.order?.merchant_order_id || null,
      success: webhookData.success === true || webhookData.success === 'true',
      amount: webhookData.amount_cents / 100,
      currency: webhookData.currency,
      errorOccurred: webhookData.error_occured,
      isPending: webhookData.pending,
      isRefunded: webhookData.is_refunded,
      createdAt: webhookData.created_at,
      integrationId: webhookData.integration_id,
      sourceData: {
        type: webhookData.source_data_type,
        subType: webhookData.source_data_sub_type,
        pan: webhookData.source_data_pan
      }
    };
  }
}

module.exports = PaymobIntegration;
