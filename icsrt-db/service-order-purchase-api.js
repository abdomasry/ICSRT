// Enhanced Service Orders Purchase API - Ready for Paymob Integration
const { ObjectId } = require("mongodb");
const PaymobIntegration = require('./paymob-integration');

// Single instance reused across requests
const paymob = new PaymobIntegration();

function addServiceOrderPurchaseAPI(app, connectDB) {
  console.log("🔧 Loading Service Order Purchase API endpoints...");

  // POST - Initiate purchase for a confirmed service order
  app.post('/api/user/service-orders/:id/purchase', async (req, res) => {
    console.log("💳 Purchase initiation request for order:", req.params.id);
    try {
      const database = await connectDB();
      const { id } = req.params;
      const { 
        userEmail, 
        paymentMethod = 'paymob',
        billingInfo,
        couponCode
      } = req.body;
      // Always enforce EGP for Paymob to avoid currency mismatch
      const currency = 'EGP';
      
      if (!userEmail) {
        return res.status(400).json({ 
          success: false, 
          error: 'User email is required' 
        });
      }
      
      // Get the service order
      const order = await database.collection('service-orders').findOne({ 
        _id: new ObjectId(id),
        userEmail: userEmail 
      });
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          error: 'Service order not found or access denied' 
        });
      }
      
      // Check if order is confirmed by admin (can be purchased)
      if (order.status !== 'confirmed' && order.status !== 'ready-for-payment') {
        return res.status(400).json({ 
          success: false, 
          error: 'Order must be confirmed by admin before purchase',
          currentStatus: order.status
        });
      }
      
      // Check if already purchased
      if (order.paymentStatus === 'paid' || order.paymentStatus === 'completed') {
        return res.status(400).json({ 
          success: false, 
          error: 'Order has already been purchased'
        });
      }
      
      let finalAmount = order.totalAmount;
      let appliedCoupon = null;
      
      // Apply coupon if provided
      if (couponCode) {
        const coupon = await database.collection('coupons').findOne({ 
          code: couponCode.toUpperCase(),
          isActive: true,
          $or: [
            { expiresAt: { $gte: new Date() } },
            { expiresAt: { $exists: false } }
          ]
        });
        
        if (coupon) {
          if (coupon.discountType === 'percentage') {
            const discount = (finalAmount * coupon.discountValue) / 100;
            finalAmount = finalAmount - discount;
            appliedCoupon = {
              code: coupon.code,
              discountType: 'percentage',
              discountValue: coupon.discountValue,
              discountAmount: discount
            };
          } else if (coupon.discountType === 'fixed') {
            finalAmount = Math.max(0, finalAmount - coupon.discountValue);
            appliedCoupon = {
              code: coupon.code,
              discountType: 'fixed',
              discountValue: coupon.discountValue,
              discountAmount: coupon.discountValue
            };
          }
        }
      }
      
      // Create payment record
      const paymentData = {
        _id: new ObjectId(),
        orderId: order._id,
        orderNumber: order.orderNumber,
        userEmail: userEmail,
        amount: finalAmount,
        originalAmount: order.totalAmount,
        currency: currency,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        appliedCoupon: appliedCoupon,
        billingInfo: billingInfo || order.customerInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Paymob specific fields (will be populated when integrating with Paymob)
        paymobData: {
          auth_token: null,
          order_id: null,
          payment_key: null,
          iframe_url: null,
          transaction_id: null
        },
        
        // Payment flow tracking
        paymentFlow: [
          {
            step: 'initiated',
            timestamp: new Date().toISOString(),
            status: 'completed'
          }
        ]
      };
      
  // Insert payment record
  await database.collection('payments').insertOne(paymentData);
      
      // Update service order
      const updateResult = await database.collection('service-orders').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            paymentStatus: 'pending',
            paymentId: paymentData._id,
            finalAmount: finalAmount,
            appliedCoupon: appliedCoupon,
            updatedAt: new Date().toISOString()
          },
          $push: {
            messages: {
              id: `msg-${Date.now()}-payment`,
              sender: 'system',
              channel: 'system',
              message: `Payment process initiated. Amount: $${finalAmount}${appliedCoupon ? ` (Coupon "${appliedCoupon.code}" applied - Save $${appliedCoupon.discountAmount})` : ''}`,
              timestamp: new Date().toISOString(),
              read: false,
              senderInfo: 'Payment System'
            }
          }
        }
      );
      
      if (updateResult.modifiedCount === 1) {
        // Initiate Paymob payment flow (test mode via sandbox credentials)
        try {
          const orderData = {
            amount: finalAmount,
            currency,
            serviceName: order.serviceName || `Service Order ${order.orderNumber}`
          };

          const billing = billingInfo || {
            fullName: order.customerInfo?.name || 'ICSRT Customer',
            email: order.customerInfo?.email || userEmail,
            phone: order.customerInfo?.phone || '',
            address: order.customerInfo?.address || '',
            city: order.customerInfo?.city || 'NA',
            country: order.customerInfo?.country || 'EG'
          };

          const result = await paymob.initiatePayment(orderData, billing);

          if (!result.success) {
            console.warn('Paymob initiation failed:', result.error);
            return res.json({
              success: true,
              message: 'Purchase initiated. Paymob init failed in test mode.',
              paymentId: paymentData._id,
              paymentData: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                serviceName: order.serviceName,
                amount: finalAmount,
                originalAmount: order.totalAmount,
                currency,
                appliedCoupon,
                paymentMethod,
                paymentStatus: 'pending'
              },
              paymentUrl: null,
              error: result.error
            });
          }

          // Persist Paymob data in the payment record
          await database.collection('payments').updateOne(
            { _id: paymentData._id },
            {
              $set: {
                'paymobData.auth_token': result.authToken,
                'paymobData.order_id': result.orderId,
                'paymobData.payment_key': result.paymentKey,
                'paymobData.iframe_url': result.iframeUrl,
                updatedAt: new Date().toISOString()
              },
              $push: {
                paymentFlow: {
                  step: 'paymob_initiated',
                  timestamp: new Date().toISOString(),
                  status: 'completed',
                  data: {
                    orderId: result.orderId
                  }
                }
              }
            }
          );

          return res.json({
            success: true,
            message: 'Purchase initiated successfully',
            paymentId: paymentData._id,
            paymentData: {
              orderId: order._id,
              orderNumber: order.orderNumber,
              serviceName: order.serviceName,
              amount: finalAmount,
              originalAmount: order.totalAmount,
              currency,
              appliedCoupon,
              paymentMethod,
              paymentStatus: 'pending'
            },
            paymentUrl: result.iframeUrl
          });
        } catch (pmErr) {
          console.error('Unexpected Paymob error:', pmErr);
          return res.json({
            success: true,
            message: 'Purchase initiated. Paymob error (test).',
            paymentId: paymentData._id,
            paymentUrl: null,
            error: pmErr?.message || 'Paymob error'
          });
        }
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to update order for payment' 
        });
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to initiate purchase',
        details: error.message 
      });
    }
  });

  // GET - Check payment status
  app.get('/api/user/payments/:paymentId/status', async (req, res) => {
    console.log("💳 Payment status check:", req.params.paymentId);
    try {
      const database = await connectDB();
      const { paymentId } = req.params;
      const { userEmail } = req.query;
      
      const payment = await database.collection('payments').findOne({ 
        _id: new ObjectId(paymentId),
        userEmail: userEmail 
      });
      
      if (!payment) {
        return res.status(404).json({ 
          success: false, 
          error: 'Payment not found or access denied' 
        });
      }
      
      res.json({
        success: true,
        payment: {
          id: payment._id,
          orderId: payment.orderId,
          orderNumber: payment.orderNumber,
          amount: payment.amount,
          currency: payment.currency,
          paymentStatus: payment.paymentStatus,
          paymentMethod: payment.paymentMethod,
          appliedCoupon: payment.appliedCoupon,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          transactionId: payment.paymobData?.transaction_id
        }
      });
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to check payment status' 
      });
    }
  });

  // POST - Handle payment webhook (for Paymob callback)
  app.post('/api/webhooks/payment/paymob', async (req, res) => {
    console.log("🔔 Paymob webhook received");
    try {
      const database = await connectDB();
      const webhookData = req.body;
      
      // Verify webhook signature from Paymob if HMAC is provided
      const signature = req.query?.hmac || req.headers['hmac'] || req.headers['x-paymob-signature'];
      if (signature) {
        const isValid = paymob.verifyWebhookSignature(webhookData, signature);
        if (!isValid) {
          console.warn('Invalid Paymob webhook signature');
          return res.status(400).json({ error: 'Invalid webhook signature' });
        }
      }
      
      const { 
        order_id, 
        transaction_id, 
        success, 
        amount_cents,
        currency 
      } = webhookData;
      
      const payment = await database.collection('payments').findOne({
        'paymobData.order_id': order_id
      });
      
      if (!payment) {
        console.log('Payment not found for Paymob order_id:', order_id);
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      const newStatus = success ? 'completed' : 'failed';
      const amount = amount_cents / 100; // Convert from cents
      
      // Update payment record
      await database.collection('payments').updateOne(
        { _id: payment._id },
        {
          $set: {
            paymentStatus: newStatus,
            'paymobData.transaction_id': transaction_id,
            completedAt: success ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
          },
          $push: {
            paymentFlow: {
              step: 'webhook_received',
              timestamp: new Date().toISOString(),
              status: newStatus,
              data: webhookData
            }
          }
        }
      );
      
      // Update service order
      const orderStatus = success ? 'paid' : 'payment-failed';
      await database.collection('service-orders').updateOne(
        { _id: payment.orderId },
        {
          $set: {
            paymentStatus: newStatus,
            status: orderStatus,
            updatedAt: new Date().toISOString()
          },
          $push: {
            messages: {
              id: `msg-${Date.now()}-payment-result`,
              sender: 'system',
              channel: 'system',
              message: success 
                ? `Payment completed successfully! Transaction ID: ${transaction_id}. Amount: $${amount}`
                : `Payment failed. Please try again or contact support.`,
              timestamp: new Date().toISOString(),
              read: false,
              senderInfo: 'Payment System'
            }
          }
        }
      );
      
      res.json({ success: true, message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Error processing Paymob webhook:', error);
      res.status(500).json({ 
        error: 'Failed to process webhook',
        details: error.message 
      });
    }
  });

  // TEST MODE: Create a simple Paymob payment (not tied to an order) for frontend testing
  app.post('/api/payments/test-initiate', async (req, res) => {
    try {
      const database = await connectDB();
      const { amount = 10, currency = 'EGP', billingInfo = {} } = req.body || {};

      if (!billingInfo.email) {
        return res.status(400).json({ success: false, error: 'billingInfo.email is required' });
      }

      const orderData = {
        amount: Number(amount),
        currency,
        serviceName: 'ICSRT Test Payment'
      };

      const billing = {
        fullName: billingInfo.fullName || 'Test User',
        email: billingInfo.email,
        phone: billingInfo.phone || '',
        address: billingInfo.address || 'NA',
        city: billingInfo.city || 'NA',
        country: billingInfo.country || 'EG'
      };

      const result = await paymob.initiatePayment(orderData, billing);
      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error || 'Failed to init Paymob' });
      }

      // Optional: store a test payment record for traceability
      const testDoc = {
        type: 'paymob-test',
        amount: Number(amount),
        currency,
        billing,
        paymob: {
          orderId: result.orderId,
          iframeUrl: result.iframeUrl
        },
        createdAt: new Date().toISOString()
      };
      await database.collection('payments').insertOne(testDoc);

      return res.json({ success: true, iframeUrl: result.iframeUrl, paymobOrderId: result.orderId });
    } catch (err) {
      console.error('Test payment init error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  });

  // GET - Get payment history for user
  app.get('/api/user/payments', async (req, res) => {
    console.log("💳 User payment history request");
    try {
      const database = await connectDB();
      const { userEmail, limit = 50 } = req.query;
      
      if (!userEmail) {
        return res.status(400).json({ 
          success: false, 
          error: 'User email is required' 
        });
      }
      
      const payments = await database.collection('payments')
        .find({ userEmail })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      // Get associated orders
      const orderIds = payments.map(p => p.orderId);
      const orders = await database.collection('service-orders')
        .find({ _id: { $in: orderIds } })
        .toArray();
      
      const ordersMap = {};
      orders.forEach(order => {
        ordersMap[order._id.toString()] = order;
      });
      
      const enrichedPayments = payments.map(payment => ({
        ...payment,
        order: ordersMap[payment.orderId.toString()]
      }));
      
      res.json({
        success: true,
        payments: enrichedPayments
      });
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch payment history' 
      });
    }
  });

  // POST - Validate coupon code
  app.post('/api/user/coupons/validate', async (req, res) => {
    console.log("🎫 Coupon validation request");
    try {
      const database = await connectDB();
      const { couponCode, orderAmount } = req.body;
      
      if (!couponCode) {
        return res.status(400).json({ 
          success: false, 
          error: 'Coupon code is required' 
        });
      }
      
      const coupon = await database.collection('coupons').findOne({ 
        code: couponCode.toUpperCase(),
        isActive: true,
        $or: [
          { expiresAt: { $gte: new Date() } },
          { expiresAt: { $exists: false } }
        ]
      });
      
      if (!coupon) {
        return res.json({ 
          success: false, 
          valid: false,
          error: 'Invalid or expired coupon code' 
        });
      }
      
      let discountAmount = 0;
      if (orderAmount) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (orderAmount * coupon.discountValue) / 100;
        } else if (coupon.discountType === 'fixed') {
          discountAmount = Math.min(coupon.discountValue, orderAmount);
        }
      }
      
      res.json({
        success: true,
        valid: true,
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discountAmount,
          minimumAmount: coupon.minimumAmount,
          expiresAt: coupon.expiresAt
        }
      });
    } catch (error) {
      console.error('Error validating coupon:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to validate coupon' 
      });
    }
  });

  console.log("✅ Service Order Purchase API endpoints loaded successfully");
}

module.exports = { addServiceOrderPurchaseAPI };
