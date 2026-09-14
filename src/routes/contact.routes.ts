import express from 'express';
import * as contactController from '../controllers/contact.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Contact Requests
router.post('/contact-requests', contactController.createContact);
router.post('/contact', contactController.createContact);
router.post('/contacts', contactController.createContact);

router.get('/contact-requests', requireAdmin, contactController.getContacts);
router.get('/contacts', requireAdmin, contactController.getContacts);
router.get('/admin/contact-requests', requireAdmin, contactController.getContacts);

// Mark as read aliases
router.put('/contact-requests/:id/read', requireAdmin, contactController.markContactAsRead);
router.patch('/contact-requests/:id/read', requireAdmin, contactController.markContactAsRead);
router.put('/contacts/:id/read', requireAdmin, contactController.markContactAsRead);
router.patch('/contacts/:id/read', requireAdmin, contactController.markContactAsRead);

// Reply aliases
router.post('/contact-requests/:id/reply', requireAdmin, contactController.replyToContact);
router.post('/contacts/:id/reply', requireAdmin, contactController.replyToContact);
router.put('/contact-requests/:id/reply', requireAdmin, contactController.replyToContact);
router.put('/contacts/:id/reply', requireAdmin, contactController.replyToContact);

// Convert to ticket aliases
router.post('/contact-requests/:id/convert-to-ticket', requireAdmin, contactController.convertToTicket);
router.post('/contacts/:id/convert-to-ticket', requireAdmin, contactController.convertToTicket);

// Delete contact aliases
router.delete('/contact-requests/:id', requireAdmin, contactController.deleteContact);
router.delete('/contacts/:id', requireAdmin, contactController.deleteContact);

// Newsletter Subscribers
router.post('/newsletter/subscribe', contactController.subscribeNewsletter);
router.post('/newsletter/unsubscribe', contactController.unsubscribeNewsletter);
router.get('/newsletter/subscribers', requireAdmin, contactController.getNewsletterSubscribers);
router.get('/newsletter-subscribers', requireAdmin, contactController.getNewsletterSubscribers);
router.delete('/newsletter/subscribers/:id', requireAdmin, contactController.deleteNewsletterSubscriber);

export default router;
