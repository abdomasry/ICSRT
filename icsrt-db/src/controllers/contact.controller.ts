import { Response } from 'express';
import ContactModel from '../models/Contact.model';
import NewsletterModel from '../models/Newsletter.model';
import TicketModel from '../models/Ticket.model';
import { sendSuccess } from '../utils/response';
import { parseObjectId } from '../utils/helpers';
import { getDB } from '../config/db';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, BadRequestError } from '../utils/errors';

export const createContact = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, fullName, email, userEmail, subject, message, phone, category } = req.body;
  const senderName = name || fullName || 'Guest';
  const senderEmail = email || userEmail || '';
  if (!senderName || !senderEmail || !message) {
    throw new BadRequestError('Name, email, and message are required');
  }

  const contact = await ContactModel.create({
    name: senderName,
    email: senderEmail,
    phone: phone || '',
    subject: subject || category || 'General Inquiry',
    message,
    isRead: false,
    status: 'new'
  });

  return sendSuccess(res, 'Thank you for reaching out! Your message has been received.', { contact, data: contact }, 201);
});

export const getContacts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query: Record<string, any> = {};
  if (req.query.status) {
    query.status = req.query.status;
  }

  const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 100) : undefined;
  const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : (req.query.page ? (parseInt(req.query.page as string, 10) - 1) * (limit || 20) : undefined);

  const contacts = await ContactModel.findAll(query, { limit, skip });
  return sendSuccess(res, 'Contact messages retrieved', { contacts, data: contacts, count: contacts.length });
});

export const markContactAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updated = await ContactModel.updateStatus(req.params.id, 'read');
  if (!updated) throw new NotFoundError('Contact message not found');
  return sendSuccess(res, 'Marked as read', { contact: updated, data: updated });
});

export const replyToContact = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const replyContent = req.body.replyMessage || req.body.message || req.body.text || req.body.content;
  if (!replyContent) throw new BadRequestError('Reply message content is required');
  const updated = await ContactModel.updateStatus(req.params.id as string, 'replied');
  if (!updated) throw new NotFoundError('Contact message not found');
  return sendSuccess(res, 'Reply recorded successfully', { contact: updated, data: updated });
});

export const convertToTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const objectId = parseObjectId(req.params.id);
  const db = await getDB();
  const contact = await db.collection('contacts').findOne({ _id: objectId });
  if (!contact) throw new NotFoundError('Contact message not found');

  const ticket = await TicketModel.create({
    userName: contact.name,
    userEmail: contact.email,
    subject: contact.subject || 'Converted from Contact Form',
    category: 'General',
    priority: 'medium',
    messages: [{
      sender: contact.name || contact.email,
      senderRole: 'user',
      text: contact.message,
      createdAt: new Date()
    }]
  });

  await ContactModel.updateStatus(req.params.id as string, 'converted');
  return sendSuccess(res, 'Contact converted to support ticket successfully', { ticket }, 201);
});

export const deleteContact = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const objectId = parseObjectId(req.params.id as string);
  const db = await getDB();
  const collection = db.collection('contacts');
  const filter = objectId ? { _id: objectId } : { id: req.params.id };
  const resDel = await collection.deleteOne(filter);
  if (resDel.deletedCount === 0) throw new NotFoundError('Contact message not found');
  return sendSuccess(res, 'Contact message deleted');
});

// Newsletter controllers
export const subscribeNewsletter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, name } = req.body;
  if (!email) throw new BadRequestError('Email address is required');
  const subscriber = await NewsletterModel.subscribe(email, name);
  return sendSuccess(res, 'Successfully subscribed to newsletter', { subscriber, data: subscriber }, 201);
});

export const getNewsletterSubscribers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const status = (req.query.status as string) || 'all';
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '20', 10);
  const search = (req.query.search as string) || '';

  const { subscribers, total } = await NewsletterModel.findAll(status, page, limit, search);
  return sendSuccess(res, 'Subscribers retrieved successfully', { subscribers, total, page, limit });
});

export const unsubscribeNewsletter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError('Email address is required');
  await NewsletterModel.unsubscribe(email);
  return sendSuccess(res, 'Successfully unsubscribed');
});

export const deleteNewsletterSubscriber = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await NewsletterModel.deleteById(req.params.id as string);
  if (!deleted) throw new NotFoundError('Subscriber not found');
  return sendSuccess(res, 'Subscriber deleted successfully');
});
