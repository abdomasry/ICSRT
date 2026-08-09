import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import serviceRoutes from './service.routes';
import ticketRoutes from './ticket.routes';
import couponRoutes from './coupon.routes';
import articleRoutes from './article.routes';
import socialRoutes from './social.routes';
import whatsappRoutes from './whatsapp.routes';
import contactRoutes from './contact.routes';
import paymentRoutes from './payment.routes';
import dashboardRoutes from './dashboard.routes';
import uploadRoutes from './upload.routes';
import cmsRoutes from './cms.routes';

const router = express.Router();

router.use('/', authRoutes);
router.use('/', uploadRoutes);
router.use('/users', userRoutes);
router.use('/', serviceRoutes);
router.use('/', ticketRoutes);
router.use('/', couponRoutes);
router.use('/', articleRoutes);
router.use('/', socialRoutes);
router.use('/', whatsappRoutes);
router.use('/', contactRoutes);
router.use('/payment', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', cmsRoutes);

export default router;
