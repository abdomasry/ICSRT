import express from 'express';
import * as whatsappController from '../controllers/whatsapp.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/whatsapp/status', requireAdmin, whatsappController.getStatus);
router.post('/whatsapp/initialize', requireAdmin, whatsappController.initializeClient);
router.get('/whatsapp/qr', requireAdmin, whatsappController.getQRCode);
router.post('/whatsapp/send-test', requireAdmin, whatsappController.sendTestMessage);
router.post('/whatsapp/disconnect', requireAdmin, whatsappController.disconnectClient);

export default router;
