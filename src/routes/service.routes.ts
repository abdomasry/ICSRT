import express from 'express';
import * as serviceController from '../controllers/service.controller';
import { requireAdmin, requireUser, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import upload from '../middleware/upload.middleware';
import {
  createServiceSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  setOrderPriceSchema
} from '../validators/service.schema';

const router = express.Router();

router.get('/services', serviceController.getServices);
router.post('/services', requireAdmin, validate(createServiceSchema), serviceController.createService);
router.get('/services/:id', serviceController.getServiceById);
router.put('/services/:id', requireAdmin, serviceController.updateService);
router.delete('/services/:id', requireAdmin, serviceController.deleteService);

router.post('/service-orders', optionalAuth, upload.any(), validate(createOrderSchema), serviceController.createOrder);
router.get('/service-orders', requireAdmin, serviceController.getAdminOrders);
router.get('/user/service-orders', requireUser, serviceController.getUserOrders);
router.get('/user/service-orders/:id', requireUser, serviceController.getOrderById);

router.get('/admin/service-orders', requireAdmin, serviceController.getAdminOrders);
router.get('/admin/service-orders/enhanced', requireAdmin, serviceController.getAdminOrders);
router.put('/admin/service-orders/:id/status', requireAdmin, validate(updateOrderStatusSchema), serviceController.updateOrderStatus);
router.put('/admin/service-orders/:id/price/enhanced', requireAdmin, validate(setOrderPriceSchema), serviceController.setOrderPrice);
router.post('/admin/service-orders/:orderId/generate-purchase-link', requireAdmin, serviceController.generatePurchaseLink);
router.get('/purchase-link/:token', serviceController.getPurchaseLinkDetails);

export default router;
