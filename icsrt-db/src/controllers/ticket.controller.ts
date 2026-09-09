import { Response } from 'express';
import TicketModel from '../models/Ticket.model';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, ITicketMessage } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { UnauthorizedError, ForbiddenError, NotFoundError, BadRequestError } from '../utils/errors';

export const createTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const ticketId = 'TCK-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
  const textMsg = req.body.message || req.body.text || req.body.content || '';
  if (!textMsg) {
    throw new BadRequestError('Message text is required');
  }

  const userEmail = req.user?.email || req.body.email || req.body.userEmail;
  if (!userEmail) {
    throw new BadRequestError('User email address is required');
  }

  const initialMessage: ITicketMessage = {
    sender: req.user?.name || req.body.name || req.body.userName || req.user?.email || 'User',
    senderRole: req.user?.role || 'user',
    text: textMsg,
    createdAt: new Date()
  };

  const newTicket = await TicketModel.create({
    ticketId,
    userEmail: userEmail.toLowerCase().trim(),
    userName: req.user?.name || req.body.name || req.body.userName || 'User',
    subject: req.body.subject || 'Support Ticket',
    category: req.body.category || 'General',
    priority: req.body.priority || 'medium',
    status: 'open',
    messages: [initialMessage]
  });

  return sendSuccess(res, 'Ticket created successfully', { ticket: newTicket, data: newTicket, ticketNumber: ticketId }, 201);
});

export const getTickets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required to view tickets');
  }

  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
  const query: Record<string, any> = {};

  if (isAdmin) {
    const emailParam = (req.query.userEmail as string) || (req.query.email as string);
    if (emailParam) {
      query.userEmail = emailParam.toLowerCase().trim();
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
  } else {
    query.userEmail = req.user.email.toLowerCase().trim();
  }

  const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 100) : undefined;
  const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : (req.query.page ? (parseInt(req.query.page as string, 10) - 1) * (limit || 20) : undefined);

  const tickets = await TicketModel.find(query, { limit, skip });
  return sendSuccess(res, 'Tickets retrieved', { tickets, data: tickets, count: tickets.length });
});

export const getTicketsByEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required to view tickets');
  }

  const email = (req.params.email as string).toLowerCase().trim();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
  const isOwner = req.user.email.toLowerCase().trim() === email;

  if (!isAdmin && !isOwner) {
    throw new ForbiddenError('You are not authorized to view tickets for this email');
  }

  const tickets = await TicketModel.find({ userEmail: email });
  return sendSuccess(res, 'User tickets retrieved', { tickets, data: tickets, count: tickets.length });
});

export const getTicketById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const ticket = await TicketModel.findById(req.params.id as string);
  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
  const isOwner = ticket.userEmail && req.user?.email && ticket.userEmail.toLowerCase().trim() === req.user.email.toLowerCase().trim();

  if (!isAdmin && !isOwner) {
    throw new ForbiddenError('You are not authorized to view this ticket');
  }

  return sendSuccess(res, 'Ticket details retrieved', { ticket, data: ticket });
});

export const addTicketMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required to reply to tickets');
  }

  const textMsg = req.body.message || req.body.text || req.body.responseMessage || req.body.replyMessage || '';
  if (!textMsg) {
    throw new BadRequestError('Message text is required');
  }

  const ticket = await TicketModel.findById(req.params.id as string);
  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
  const isOwner = ticket.userEmail && req.user.email && ticket.userEmail.toLowerCase().trim() === req.user.email.toLowerCase().trim();

  if (!isAdmin && !isOwner) {
    throw new ForbiddenError('You are not authorized to reply to this ticket');
  }

  const messageObj: ITicketMessage = {
    sender: req.user.name || req.user.email,
    senderRole: isAdmin ? 'admin' : 'user',
    text: textMsg,
    createdAt: new Date()
  };

  const updatedTicket = await TicketModel.addMessage(req.params.id as string, messageObj);
  return sendSuccess(res, 'Reply added to ticket', { ticket: updatedTicket, data: updatedTicket });
});

export const updateTicketStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const status = req.body.status || 'in_progress';
  const updatedTicket = await TicketModel.updateById(req.params.id as string, { status });
  if (!updatedTicket) {
    throw new NotFoundError('Ticket not found');
  }

  return sendSuccess(res, 'Ticket status updated', { ticket: updatedTicket, data: updatedTicket });
});

export const resolveTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { resolutionMessage } = req.body;
  if (resolutionMessage) {
    await TicketModel.addMessage(req.params.id as string, {
      sender: req.body.resolvedBy || req.user?.name || 'ICSRT Support Team',
      senderRole: 'admin',
      text: `[Resolution] ${resolutionMessage}`,
      createdAt: new Date()
    });
  }
  const updatedTicket = await TicketModel.updateById(req.params.id as string, { status: 'resolved' });
  if (!updatedTicket) throw new NotFoundError('Ticket not found');
  return sendSuccess(res, 'Ticket resolved successfully', { ticket: updatedTicket, data: updatedTicket });
});

export const closeTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { closeReason } = req.body;
  if (closeReason) {
    await TicketModel.addMessage(req.params.id as string, {
      sender: req.body.closedBy || req.user?.name || 'ICSRT Support Team',
      senderRole: 'admin',
      text: `[Ticket Closed] ${closeReason}`,
      createdAt: new Date()
    });
  }
  const updatedTicket = await TicketModel.updateById(req.params.id as string, { status: 'closed' });
  if (!updatedTicket) throw new NotFoundError('Ticket not found');
  return sendSuccess(res, 'Ticket closed successfully', { ticket: updatedTicket, data: updatedTicket });
});
