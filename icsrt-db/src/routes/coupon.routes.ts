import express from 'express';
import * as couponController from '../controllers/coupon.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/coupons/validate', couponController.validateCoupon);
router.get('/admin/coupons', requireAdmin, couponController.getCoupons);
router.post('/admin/coupons', requireAdmin, couponController.createCoupon);
router.post('/admin/coupons/:code/deactivate', requireAdmin, couponController.deactivateCoupon);
router.post('/admin/coupons/:code/reactivate', requireAdmin, couponController.reactivateCoupon);
router.delete('/admin/coupons/:code', requireAdmin, couponController.deleteCoupon);

export default router;
