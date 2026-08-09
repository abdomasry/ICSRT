import { Response } from 'express';
import ContactModel from '../models/Contact.model';
import TicketModel from '../models/Ticket.model';
import { sendSuccess, sendError } from '../utils/response';
import { parseObjectId } from '../utils/helpers';
import { getDB } from '../config/db';
import { AuthenticatedRequest, ITicketMessage } from '../types';

export async function createContact(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, fullName, email, userEmail, subject, message, phone, category } = req.body;
    const senderName = name || fullName || 'Guest';
    const senderEmail = email || userEmail || '';
    if (!senderName || !senderEmail || !message) {
      return sendError(res, 'Name, email, and message are required', 400);
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
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getContacts(req: AuthenticatedRequest, res: Response) {
  try {
    const contacts = await ContactModel.findAll();
    return sendSuccess(res, 'Contact messages retrieved', { contacts, data: contacts });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function markContactAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const updated = await ContactModel.updateStatus(req.params.id, 'read');
    if (!updated) return sendError(res, 'Contact message not found', 404);
    return sendSuccess(res, 'Marked as read', { contact: updated, data: updated });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function deleteContact(req: AuthenticatedRequest, res: Response) {
  try {
    const objectId = parseObjectId(req.params.id);
    const db = await getDB();
    const collection = db.collection('contacts');
    const filter = objectId ? { _id: objectId } : { id: req.params.id };
    const resDel = await collection.deleteOne(filter);
    if (resDel.deletedCount === 0) return sendError(res, 'Contact message not found', 404);
    return sendSuccess(res, 'Contact message deleted');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function convertToTicket(req: AuthenticatedRequest, res: Response) {
  try {
    const contact = await ContactModel.findById(req.params.id);
    if (!contact) {
      return sendError(res, 'Contact request not found', 404);
    }

    const ticketId = 'TCK-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
    const initialMessage: ITicketMessage = {
      sender: contact.email,
      senderRole: 'user',
      text: contact.message,
      createdAt: contact.createdAt || new Date()
    };

    const ticket = await TicketModel.create({
      ticketId,
      userEmail: contact.email,
      userName: contact.name,
      subject: contact.subject || 'Converted Inquiry',
      category: 'Contact Inquiry',
      priority: 'medium',
      status: 'open',
      messages: [initialMessage]
    });

    await ContactModel.updateStatus(contact._id, 'converted');

    return sendSuccess(res, 'Contact request converted to ticket successfully', { ticket, data: ticket }, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function replyToContact(req: AuthenticatedRequest, res: Response) {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage || !replyMessage.trim()) {
      return sendError(res, 'Reply message is required', 400);
    }
    const updated = await ContactModel.updateStatus(req.params.id, 'replied');
    return sendSuccess(res, 'Reply recorded', { contact: updated, data: updated });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
