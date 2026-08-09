import { Response } from 'express';
import paymobService from '../services/paymob.service';
import ServiceModel from '../models/Service.model';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export async function initiateCheckout(req: AuthenticatedRequest, res: Response) {
  try {
    const { orderId, amount, currency, serviceName, fullName, email, phone, paymentMethod } = req.body;
    if (!amount || (!orderId && !serviceName)) {
      return sendError(res, 'Order details and amount are required', 400);
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
      return sendError(res, result.error || 'Failed to initiate payment', 500);
    }

    return sendSuccess(res, 'Checkout initiated', result);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function paymobCallback(req: AuthenticatedRequest, res: Response) {
  try {
    const isSuccess = req.body.obj?.success === true || req.query.success === 'true';
    const merchantOrderId = req.body.obj?.order?.merchant_order_id || req.query.merchant_order_id;

    if (merchantOrderId) {
      await ServiceModel.updateOrderById(merchantOrderId, {
        status: isSuccess ? 'paid' : 'payment_failed',
        customerInfo: req.body.obj || req.query
      });
    }

    return sendSuccess(res, 'Callback processed', { status: isSuccess ? 'success' : 'failed' });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
