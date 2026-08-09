import express from 'express';
import * as ticketController from '../controllers/ticket.controller';
import { optionalAuth, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/tickets', optionalAuth, ticketController.getTickets);
router.post('/tickets', optionalAuth, ticketController.createTicket);
router.get('/tickets/:id', optionalAuth, ticketController.getTicketById);
router.post('/tickets/:id/messages', optionalAuth, ticketController.addTicketMessage);
router.put('/tickets/:id/status', requireAdmin, ticketController.updateTicketStatus);

export default router;
