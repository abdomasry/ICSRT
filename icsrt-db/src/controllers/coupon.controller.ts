import { Response } from 'express';
import CouponModel from '../models/Coupon.model';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export async function createCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const { code, discountType, discountValue, expiryDate, minPurchaseAmount } = req.body;
    if (!code || !discountValue) {
      return sendError(res, 'Coupon code and discount value are required', 400);
    }

    const existing = await CouponModel.findByCode(code);
    if (existing) {
      return sendError(res, 'Coupon code already exists', 409);
    }

    const coupon = await CouponModel.create({
      code,
      discountType: discountType || 'percentage',
      discountValue: parseFloat(discountValue),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : 0,
      isActive: true
    });

    return sendSuccess(res, 'Coupon created successfully', { coupon, data: coupon }, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getCoupons(req: AuthenticatedRequest, res: Response) {
  try {
    const coupons = await CouponModel.findAll();
    return sendSuccess(res, 'Coupons retrieved', { coupons, data: coupons });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function validateCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const { code, orderAmount } = req.body;
    if (!code) {
      return sendError(res, 'Coupon code required', 400);
    }

    const coupon = await CouponModel.findByCode(code);
    if (!coupon || !coupon.isActive) {
      return sendError(res, 'Invalid or inactive coupon code', 404);
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return sendError(res, 'Coupon has expired', 400);
    }

    if (coupon.minPurchaseAmount && orderAmount < coupon.minPurchaseAmount) {
      return sendError(res, `Minimum purchase amount for this coupon is $${coupon.minPurchaseAmount}`, 400);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    return sendSuccess(res, 'Coupon code applied', {
      valid: true,
      coupon,
      discountAmount: Math.min(discountAmount, orderAmount),
      finalAmount: Math.max(0, orderAmount - discountAmount)
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function deactivateCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const code = req.params.code as string;
    const coupon = await CouponModel.updateStatus(code, false);
    if (!coupon) return sendError(res, 'Coupon not found', 404);
    return sendSuccess(res, 'Coupon deactivated', { coupon, data: coupon });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function reactivateCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const code = req.params.code as string;
    const coupon = await CouponModel.updateStatus(code, true);
    if (!coupon) return sendError(res, 'Coupon not found', 404);
    return sendSuccess(res, 'Coupon reactivated', { coupon, data: coupon });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function deleteCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const code = req.params.code as string;
    const deleted = await CouponModel.deleteByCode(code);
    if (!deleted) return sendError(res, 'Coupon not found', 404);
    return sendSuccess(res, 'Coupon deleted');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
