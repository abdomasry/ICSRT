import express from 'express';
import * as authController from '../controllers/auth.controller';
import { requireUser } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';

const router = express.Router();

router.post('/login', authLimiter, authController.login);
router.post('/signup', authLimiter, authController.signup);
router.post('/register', authLimiter, authController.signup);
router.post('/verify-email', authController.verifyEmail);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/change-password', requireUser, authController.changePassword);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.get('/reset-password/:token/validate', (req, res) => res.json({ success: true }));
router.post('/reset-password', authLimiter, authController.resetPassword);

export default router;
