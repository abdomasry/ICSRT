import { Response } from 'express';
import paymobService from '../services/paymob.service';
import ServiceModel from '../models/Service.model';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, InternalServerError, NotFoundError, UnauthorizedError } from '../utils/errors';

export const initiateCheckout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, amount, currency, serviceName, fullName, email, phone, paymentMethod } = req.body;
  if (!amount || (!orderId && !serviceName)) {
    throw new BadRequestError('Order details and amount are required');
  }

  const orderData = {
    orderNumber: orderId || 'ORD-' + Date.now(),
    amount: parseFloat(amount),
    currency: currency || 'USD',
    serviceName: serviceName || 'ICSRT Service'
  };

  const billingInfo = {
    fullName: fullName || req.user?.name || 'Customer',
    email: email || req.user?.email || 'customer@icsrt.cloud',
    phone: phone || ''
  };

  const result = await paymobService.initiateCheckout(orderData, billingInfo, paymentMethod);
  if (!result.success) {
    throw new InternalServerError(result.error || 'Failed to initiate payment');
  }

  return sendSuccess(res, 'Checkout initiated', result);
});

export const paymobCallback = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const obj = req.body.obj || req.body;
  const receivedHmac = (req.query.hmac as string) || req.body.hmac || (req.headers['x-paymob-hmac'] as string) || '';

  // 1. Verify HMAC (Fail-Closed)
  const isValidHmac = paymobService.verifyHMAC(obj, receivedHmac);
  if (!isValidHmac) {
    console.error('❌ Paymob Webhook: Invalid or missing HMAC signature');
    return res.status(400).json({ success: false, error: 'Invalid HMAC signature' });
  }

  // 2. Validate merchant order reference
  const merchantOrderId = obj?.order?.merchant_order_id || req.query.merchant_order_id;
  if (!merchantOrderId) {
    return res.status(400).json({ success: false, error: 'Merchant order ID missing from webhook payload' });
  }

  // 3. Find corresponding order
  const order = await ServiceModel.findOrderById(merchantOrderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order referenced in webhook not found' });
  }

  // 4. Idempotency Check (prevent duplicate processing)
  if (order.paymobTransactionId && String(order.paymobTransactionId) === String(obj.id)) {
    return sendSuccess(res, 'Callback already processed (idempotent)', {
      orderNumber: order.orderNumber,
      status: order.status,
      duplicate: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        duplicate: true
      }
    });
  }

  // 5. Determine transaction outcome
  const isSuccess = obj.success === true && obj.pending === false && obj.error_occured === false;

  // 6. Update order with payment details
  await ServiceModel.updateOrderById(order._id, {
    status: isSuccess ? 'paid' : 'payment_failed',
    paymobTransactionId: obj.id,
    paidAmountCents: obj.amount_cents,
    paidCurrency: obj.currency,
    paidAt: isSuccess ? new Date() : undefined,
    paymentMetadata: {
      paymobOrderId: obj.order?.id,
      paymentMethod: obj.source_data?.type || 'card',
      pan: obj.source_data?.pan
    }
  });

  return sendSuccess(res, 'Callback processed successfully', {
    orderNumber: order.orderNumber,
    status: isSuccess ? 'paid' : 'failed'
  });
});

export const getUserPayments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required to view payments');
  }

  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
  let userEmail: string | undefined;

  if (isAdmin && (req.query.userEmail || req.query.email)) {
    userEmail = ((req.query.userEmail as string) || (req.query.email as string)).toLowerCase().trim();
  } else {
    userEmail = req.user.email.toLowerCase().trim();
  }

  const orders = await ServiceModel.findOrders(userEmail ? { userEmail } : {});
  const payments = orders.map(o => ({
    _id: o._id,
    orderNumber: o.orderNumber,
    serviceTitle: o.serviceTitle || o.serviceName || 'Service Purchase',
    amount: o.price || 0,
    currency: o.currency || 'USD',
    status: o.status || 'pending',
    createdAt: o.createdAt || new Date(),
    paidAt: o.paidAt
  }));

  return sendSuccess(res, 'User payments retrieved', { payments, data: payments });
});
