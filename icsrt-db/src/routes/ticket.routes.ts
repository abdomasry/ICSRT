import express from 'express';
import * as ticketController from '../controllers/ticket.controller';
import { requireUser, optionalAuth, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/tickets', requireUser, ticketController.getTickets);
router.get('/tickets/user/:email', requireUser, ticketController.getTicketsByEmail);
router.post('/tickets', optionalAuth, ticketController.createTicket);
router.get('/tickets/:id', requireUser, ticketController.getTicketById);

// Ticket Replies
router.post('/tickets/:id/messages', requireUser, ticketController.addTicketMessage);
router.post('/tickets/:id/respond', requireUser, ticketController.addTicketMessage);
router.post('/tickets/:id/reply', requireUser, ticketController.addTicketMessage);

// Ticket Status Updates
router.put('/tickets/:id/status', requireAdmin, ticketController.updateTicketStatus);
router.patch('/tickets/:id/status', requireAdmin, ticketController.updateTicketStatus);

// Specific Ticket Actions
router.patch('/tickets/:id/resolve', requireAdmin, ticketController.resolveTicket);
router.post('/tickets/:id/resolve', requireAdmin, ticketController.resolveTicket);

router.patch('/tickets/:id/close', requireAdmin, ticketController.closeTicket);
router.post('/tickets/:id/close', requireAdmin, ticketController.closeTicket);

export default router;
