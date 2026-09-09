import express from 'express';
import * as authController from '../controllers/auth.controller';
import { requireUser } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  loginSchema,
  signupSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validators/auth.schema';

const router = express.Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/admin-login', authLimiter, validate(loginSchema), authController.adminLogin);
router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/register', authLimiter, validate(signupSchema), authController.signup);
router.post('/verify-email', authController.verifyEmail);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/change-password', requireUser, validate(changePasswordSchema), authController.changePassword);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.get('/reset-password/:token/validate', (req, res) => res.json({ success: true }));
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

export default router;
