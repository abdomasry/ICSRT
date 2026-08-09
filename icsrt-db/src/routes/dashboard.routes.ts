import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/stats', requireAdmin, dashboardController.getDashboardStats);
router.get('/metrics', requireAdmin, dashboardController.getDashboardStats);

export default router;
