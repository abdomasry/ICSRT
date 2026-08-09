import { Response } from 'express';
import whatsappService from '../services/whatsapp.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export async function getStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const status = whatsappService.getStatus();
    return sendSuccess(res, 'WhatsApp status retrieved', status);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function initializeClient(req: AuthenticatedRequest, res: Response) {
  try {
    whatsappService.initialize();
    return sendSuccess(res, 'WhatsApp client initialization started');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getQRCode(req: AuthenticatedRequest, res: Response) {
  try {
    const status = whatsappService.getStatus();
    if (status.isReady) {
      return sendSuccess(res, 'WhatsApp client is already ready and connected', { isReady: true });
    }
    if (!status.lastQR) {
      return sendError(res, 'QR code not generated yet. Initialize WhatsApp client first.', 404);
    }
    return sendSuccess(res, 'QR Code retrieved', { qr: status.lastQR });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function sendTestMessage(req: AuthenticatedRequest, res: Response) {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return sendError(res, 'Phone number and message are required', 400);
    }
    const result = await whatsappService.sendMessage(phone, message);
    return sendSuccess(res, 'Test message sent successfully', { result });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function disconnectClient(req: AuthenticatedRequest, res: Response) {
  try {
    await whatsappService.disconnect();
    return sendSuccess(res, 'WhatsApp client disconnected successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
