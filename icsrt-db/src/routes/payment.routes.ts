import express from 'express';
import * as paymentController from '../controllers/payment.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/paymob/initiate', optionalAuth, paymentController.initiateCheckout);
router.post('/paymob/callback', paymentController.paymobCallback);
router.get('/paymob/callback', paymentController.paymobCallback);

export default router;
