import { Queue, QueueOptions } from 'bullmq';
import { redisConnection, isRedisAvailable } from '../config/redis';
import logger from '../utils/logger';

export interface WhatsAppJobData {
  type: 'send_message' | 'initialize' | 'disconnect';
  phoneNumber?: string;
  message?: string;
}

const queueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: {
      age: 3600,
      count: 1000
    },
    removeOnFail: {
      age: 86400,
      count: 500
    }
  }
};

export const whatsappQueue = new Queue<WhatsAppJobData>('whatsappQueue', queueOptions);

whatsappQueue.on('error', (err: any) => {
  logger.warn(`⚠️ whatsappQueue Redis event: ${err.message || 'Queue connection error'}`);
});

export async function enqueueWhatsAppMessage(phoneNumber: string, message: string): Promise<{ queued: boolean; jobId?: string; message?: string }> {
  const jobData: WhatsAppJobData = {
    type: 'send_message',
    phoneNumber,
    message
  };

  if (isRedisAvailable()) {
    try {
      const job = await whatsappQueue.add('send_whatsapp_message', jobData);
      logger.info(`📱 Queued WhatsApp message to ${phoneNumber} (Job ID: ${job.id})`);
      return { queued: true, jobId: job.id };
    } catch (err: any) {
      logger.error(`❌ Failed to enqueue WhatsApp message: ${err.message}`);
      return { queued: false, message: err.message };
    }
  }

  logger.warn('⚠️ WhatsApp queue is unavailable (Redis offline). Message could not be enqueued.');
  return { queued: false, message: 'Redis queue is offline. Start the WhatsApp worker and Redis.' };
}

export async function enqueueWhatsAppCommand(type: 'initialize' | 'disconnect'): Promise<{ queued: boolean; message?: string }> {
  if (isRedisAvailable()) {
    try {
      await whatsappQueue.add(`whatsapp_cmd_${type}`, { type });
      return { queued: true };
    } catch (err: any) {
      return { queued: false, message: err.message };
    }
  }
  return { queued: false, message: 'Redis queue is offline' };
}
