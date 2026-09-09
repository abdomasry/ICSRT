import { Response } from 'express';
import CouponModel from '../models/Coupon.model';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors';

export const createCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { code, discountType, discountValue, expiryDate, minPurchaseAmount } = req.body;

  const existing = await CouponModel.findByCode(code);
  if (existing) {
    throw new ConflictError('Coupon code already exists');
  }

  const coupon = await CouponModel.create({
    code: code.toUpperCase().trim(),
    discountType: discountType || 'percentage',
    discountValue: parseFloat(discountValue),
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : 0,
    isActive: true
  });

  return sendSuccess(res, 'Coupon created successfully', { coupon, data: coupon }, 201);
});

export const getCoupons = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const coupons = await CouponModel.findAll();
  return sendSuccess(res, 'Coupons retrieved successfully', { coupons, data: coupons });
});

export const validateCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { code, orderAmount = 0 } = req.body;
  const coupon = await CouponModel.findByCode(code.trim().toUpperCase());
  if (!coupon || !coupon.isActive) {
    throw new NotFoundError('Invalid or inactive coupon code');
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    throw new BadRequestError('Coupon code has expired');
  }

  if (coupon.minPurchaseAmount && orderAmount < coupon.minPurchaseAmount) {
    throw new BadRequestError(`Minimum purchase amount for this coupon is $${coupon.minPurchaseAmount}`);
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderAmount * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  return sendSuccess(res, 'Coupon code applied successfully', {
    valid: true,
    coupon,
    discountAmount: Math.min(discountAmount, orderAmount),
    finalAmount: Math.max(0, orderAmount - discountAmount)
  });
});

export const deactivateCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const code = req.params.code as string;
  const coupon = await CouponModel.updateStatus(code, false);
  if (!coupon) throw new NotFoundError('Coupon not found');
  return sendSuccess(res, 'Coupon deactivated successfully', { coupon, data: coupon });
});

export const reactivateCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const code = req.params.code as string;
  const coupon = await CouponModel.updateStatus(code, true);
  if (!coupon) throw new NotFoundError('Coupon not found');
  return sendSuccess(res, 'Coupon reactivated successfully', { coupon, data: coupon });
});

export const deleteCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const code = req.params.code as string;
  const deleted = await CouponModel.deleteByCode(code);
  if (!deleted) throw new NotFoundError('Coupon not found');
  return sendSuccess(res, 'Coupon deleted successfully');
});
