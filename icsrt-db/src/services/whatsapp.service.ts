import { redisConnection, isRedisAvailable } from '../config/redis';
import { enqueueWhatsAppMessage, enqueueWhatsAppCommand } from '../queues/whatsapp.queue';
import logger from '../utils/logger';

const STATUS_KEY = 'whatsapp:status';
const QR_KEY = 'whatsapp:qr';

export class WhatsAppService {
  private inMemoryStatus = {
    isReady: false,
    isInitializing: false,
    hasQR: false,
    lastQR: null as string | null
  };

  async getStatus(): Promise<{ isReady: boolean; isInitializing: boolean; hasQR: boolean; lastQR: string | null }> {
    if (isRedisAvailable()) {
      try {
        const rawStatus = await redisConnection.get(STATUS_KEY);
        const qr = await redisConnection.get(QR_KEY);
        if (rawStatus) {
          const parsed = JSON.parse(rawStatus);
          return {
            isReady: !!parsed.isReady,
            isInitializing: !!parsed.isInitializing,
            hasQR: !!qr,
            lastQR: qr || null
          };
        }
      } catch (err: any) {
        logger.warn(`⚠️ Error reading WhatsApp status from Redis: ${err.message}`);
      }
    }
    return this.inMemoryStatus;
  }

  async initialize(): Promise<{ queued: boolean; message?: string }> {
    logger.info('🔄 Dispatching WhatsApp client initialization...');
    return await enqueueWhatsAppCommand('initialize');
  }

  async sendMessage(phoneNumber: string, message: string): Promise<{ queued: boolean; jobId?: string; message?: string }> {
    return await enqueueWhatsAppMessage(phoneNumber, message);
  }

  async disconnect(): Promise<{ queued: boolean; message?: string }> {
    logger.info('🔌 Dispatching WhatsApp client disconnect command...');
    return await enqueueWhatsAppCommand('disconnect');
  }
}

export default new WhatsAppService();
