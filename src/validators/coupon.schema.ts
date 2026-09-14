import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string({ message: 'Coupon code is required' }).min(2, 'Coupon code must be at least 2 characters'),
    discountType: z.enum(['percentage', 'fixed']).optional(),
    discountValue: z.number().or(z.string().transform(v => parseFloat(v))),
    maxUses: z.number().optional(),
    expiresAt: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string({ message: 'Coupon code is required' })
  })
});
