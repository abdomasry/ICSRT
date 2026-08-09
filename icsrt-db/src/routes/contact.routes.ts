import express from 'express';
import * as contactController from '../controllers/contact.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/contact-requests', contactController.createContact);
router.post('/contact', contactController.createContact);

router.get('/contact-requests', requireAdmin, contactController.getContacts);
router.get('/admin/contact-requests', requireAdmin, contactController.getContacts);
router.put('/contact-requests/:id/read', requireAdmin, contactController.markContactAsRead);
router.post('/contact-requests/:id/reply', requireAdmin, contactController.replyToContact);
router.post('/contact-requests/:id/convert-to-ticket', requireAdmin, contactController.convertToTicket);
router.delete('/contact-requests/:id', requireAdmin, contactController.deleteContact);

export default router;
