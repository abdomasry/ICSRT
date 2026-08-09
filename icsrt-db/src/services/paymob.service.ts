import axios from 'axios';
import crypto from 'crypto';

export class PaymobService {
  private config = {
    API_KEY: process.env.PAYMOB_API_KEY || 'egy_sk_test_2e9e4e5ecb9102ce8b5280e8a91ddbca8fe22d93f06e61a31bf9ffcd6ff79b19',
    PUBLIC_KEY: process.env.PAYMOB_PUBLIC_KEY || 'egy_pk_test_EkdCVViBy09fzkFx6gOSoaazj81XWVoL',
    AUTH_TOKEN: process.env.PAYMOB_AUTH_TOKEN || '',
    INTEGRATION_ID_CARD: process.env.PAYMOB_INTEGRATION_ID_CARD || '5232435',
    INTEGRATION_ID_WALLET: process.env.PAYMOB_INTEGRATION_ID_WALLET || '5232441',
    IFRAME_ID: process.env.PAYMOB_IFRAME_ID || '',
    HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET || '',
    BASE_URL: 'https://accept.paymob.com/api'
  };

  async authenticate(): Promise<string> {
    try {
      if (this.config.AUTH_TOKEN && this.config.AUTH_TOKEN.length > 0) {
        return this.config.AUTH_TOKEN;
      }
      const response = await axios.post(`${this.config.BASE_URL}/auth/tokens`, {
        api_key: this.config.API_KEY
      });
      return response.data.token;
    } catch (error: any) {
      console.error('❌ Paymob authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Paymob');
    }
  }

  async createOrder(authToken: string, orderData: any): Promise<any> {
    try {
      const paymobOrder = {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: Math.round(orderData.amount * 100),
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

      const response = await axios.post(`${this.config.BASE_URL}/ecommerce/orders`, paymobOrder);
      return response.data;
    } catch (error: any) {
      console.error('❌ Paymob order creation failed:', error.response?.data || error.message);
      throw new Error('Failed to create order on Paymob');
    }
  }

  async generatePaymentKey(authToken: string, orderId: string | number, billingInfo: any, amount: number, paymentMethod = 'card'): Promise<string> {
    try {
      const integrationId = paymentMethod === 'wallet' 
        ? this.config.INTEGRATION_ID_WALLET 
        : this.config.INTEGRATION_ID_CARD;

      const paymentKeyData = {
        auth_token: authToken,
        amount_cents: Math.round(amount * 100),
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "NA",
          email: billingInfo.email || 'customer@icsrt.com',
          floor: "NA",
          first_name: (billingInfo.fullName || billingInfo.name || 'Customer').split(' ')[0],
          street: "NA",
          building: "NA",
          phone_number: billingInfo.phone || '+201000000000',
          shipping_method: "NA",
          postal_code: "NA",
          city: "Cairo",
          country: "EG",
          last_name: (billingInfo.fullName || billingInfo.name || 'Customer').split(' ').slice(1).join(' ') || 'Customer',
          state: "Cairo"
        },
        currency: "EGP",
        integration_id: parseInt(integrationId, 10)
      };

      const response = await axios.post(`${this.config.BASE_URL}/acceptance/payment_keys`, paymentKeyData);
      return response.data.token;
    } catch (error: any) {
      console.error('❌ Paymob payment key generation failed:', error.response?.data || error.message);
      throw new Error('Failed to generate Paymob payment key');
    }
  }

  async initiateCheckout(orderData: any, billingInfo: any, paymentMethod = 'card'): Promise<any> {
    try {
      const authToken = await this.authenticate();
      const order = await this.createOrder(authToken, orderData);
      const paymentToken = await this.generatePaymentKey(
        authToken,
        order.id,
        billingInfo,
        orderData.amount,
        paymentMethod
      );

      let checkoutUrl = '';
      if (paymentMethod === 'card') {
        checkoutUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.config.IFRAME_ID}?payment_token=${paymentToken}`;
      } else {
        checkoutUrl = `https://accept.paymob.com/api/acceptance/payments/pay?payment_token=${paymentToken}`;
      }

      return {
        success: true,
        paymobOrderId: order.id,
        paymentToken,
        checkoutUrl,
        iframeId: this.config.IFRAME_ID
      };
    } catch (error: any) {
      console.error('❌ Checkout initiation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  verifyHMAC(data: any, receivedHmac: string): boolean {
    if (!this.config.HMAC_SECRET) return true;
    try {
      const concatenated = [
        data.amount_cents,
        data.created_at,
        data.currency,
        data.error_occured,
        data.has_parent_transaction,
        data.id,
        data.integration_id,
        data.is_3d_secure,
        data.is_auth,
        data.is_capture,
        data.is_refunded,
        data.is_standalone_payment,
        data.order.id,
        data.owner,
        data.pending,
        data.source_data.pan,
        data.source_data.sub_type,
        data.source_data.type,
        data.success
      ].join('');

      const calculatedHmac = crypto
        .createHmac('sha512', this.config.HMAC_SECRET)
        .update(concatenated)
        .digest('hex');

      return calculatedHmac.toLowerCase() === receivedHmac.toLowerCase();
    } catch (error) {
      console.error('❌ Error verifying HMAC:', error);
      return false;
    }
  }
}

export default new PaymobService();
