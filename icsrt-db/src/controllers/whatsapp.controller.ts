import { Response } from 'express';
import whatsappService from '../services/whatsapp.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const getStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const status = await whatsappService.getStatus();
  return sendSuccess(res, 'WhatsApp status retrieved', status);
});

export const initializeClient = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await whatsappService.initialize();
  return sendSuccess(res, 'WhatsApp client initialization dispatched to worker', result);
});

export const getQRCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const status = await whatsappService.getStatus();
  if (status.isReady) {
    return sendSuccess(res, 'WhatsApp client is already ready and connected', { isReady: true });
  }
  if (!status.lastQR) {
    throw new NotFoundError('QR code not generated yet. Ensure WhatsApp worker process is running.');
  }
  return sendSuccess(res, 'QR Code retrieved', { qr: status.lastQR });
});

export const sendTestMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    throw new BadRequestError('Phone number and message content are required');
  }
  const result = await whatsappService.sendMessage(phone, message);
  return sendSuccess(res, 'Message queued for WhatsApp delivery', { result });
});

export const disconnectClient = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await whatsappService.disconnect();
  return sendSuccess(res, 'WhatsApp client disconnect command dispatched', result);
});
