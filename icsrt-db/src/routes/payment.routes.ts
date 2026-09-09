import express from 'express';
import * as paymentController from '../controllers/payment.controller';
import { requireUser, optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/payments', requireUser, paymentController.getUserPayments);
router.get('/user/payments', requireUser, paymentController.getUserPayments);
router.post('/paymob/initiate', optionalAuth, paymentController.initiateCheckout);
router.post('/paymob/callback', paymentController.paymobCallback);
router.get('/paymob/callback', paymentController.paymobCallback);

export default router;
