import express from 'express';
import * as serviceController from '../controllers/service.controller';
import { requireAdmin, optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/services', serviceController.getServices);
router.post('/services', requireAdmin, serviceController.createService);
router.get('/services/:id', serviceController.getServiceById);
router.put('/services/:id', requireAdmin, serviceController.updateService);
router.delete('/services/:id', requireAdmin, serviceController.deleteService);

router.post('/service-orders', optionalAuth, serviceController.createOrder);
router.get('/service-orders', requireAdmin, serviceController.getAdminOrders);
router.get('/user/service-orders', optionalAuth, serviceController.getUserOrders);
router.get('/user/service-orders/:id', optionalAuth, serviceController.getOrderById);

router.get('/admin/service-orders', requireAdmin, serviceController.getAdminOrders);
router.get('/admin/service-orders/enhanced', requireAdmin, serviceController.getAdminOrders);
router.put('/admin/service-orders/:id/status', requireAdmin, serviceController.updateOrderStatus);
router.put('/admin/service-orders/:id/price/enhanced', requireAdmin, serviceController.setOrderPrice);
router.post('/admin/service-orders/:orderId/generate-purchase-link', requireAdmin, serviceController.generatePurchaseLink);
router.get('/purchase-link/:token', serviceController.getPurchaseLinkDetails);

export default router;
