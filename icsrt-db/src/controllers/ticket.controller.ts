import { Response } from 'express';
import TicketModel from '../models/Ticket.model';
import { sendSuccess, sendError } from '../utils/response';
import { validateTicketPayload } from '../validators/ticket.validator';
import { AuthenticatedRequest, ITicketMessage } from '../types';

export async function createTicket(req: AuthenticatedRequest, res: Response) {
  try {
    const validation = validateTicketPayload(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.errors.join(', '), 400);
    }

    const ticketId = 'TCK-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
    const initialMessage: ITicketMessage = {
      sender: req.user?.email || req.body.email || 'User',
      senderRole: req.user?.role || 'user',
      text: req.body.message,
      createdAt: new Date()
    };

    const newTicket = await TicketModel.create({
      ticketId,
      userEmail: req.user?.email || req.body.email,
      userName: req.body.name || req.user?.name || 'Guest User',
      subject: req.body.subject,
      category: req.body.category || 'General',
      priority: req.body.priority || 'medium',
      status: 'open',
      messages: [initialMessage]
    });

    return sendSuccess(res, 'Ticket created successfully', { ticket: newTicket, data: newTicket }, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getTickets(req: AuthenticatedRequest, res: Response) {
  try {
    const query: Record<string, any> = {};
    if (req.user && req.user.role === 'user') {
      query.userEmail = req.user.email;
    }
    const tickets = await TicketModel.find(query);
    return sendSuccess(res, 'Tickets retrieved', { tickets, data: tickets, count: tickets.length });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getTicketById(req: AuthenticatedRequest, res: Response) {
  try {
    const ticket = await TicketModel.findById(req.params.id);
    if (!ticket) {
      return sendError(res, 'Ticket not found', 404);
    }
    return sendSuccess(res, 'Ticket details retrieved', { ticket, data: ticket });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function addTicketMessage(req: AuthenticatedRequest, res: Response) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return sendError(res, 'Message text is required', 400);
    }

    const messageObj: ITicketMessage = {
      sender: req.user?.email || req.body.sender || 'User',
      senderRole: req.user?.role || req.body.senderRole || 'user',
      text: message,
      createdAt: new Date()
    };

    const updatedTicket = await TicketModel.addMessage(req.params.id, messageObj);
    if (!updatedTicket) {
      return sendError(res, 'Ticket not found', 404);
    }

    return sendSuccess(res, 'Reply added to ticket', { ticket: updatedTicket, data: updatedTicket });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateTicketStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { status } = req.body;
    if (!status) {
      return sendError(res, 'Status is required', 400);
    }

    const updatedTicket = await TicketModel.updateById(req.params.id, { status });
    if (!updatedTicket) {
      return sendError(res, 'Ticket not found', 404);
    }

    return sendSuccess(res, 'Ticket status updated', { ticket: updatedTicket, data: updatedTicket });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
