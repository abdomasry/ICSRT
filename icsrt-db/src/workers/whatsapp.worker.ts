import { Worker, Job } from 'bullmq';
import { createRedisClient } from '../config/redis';
import { WhatsAppJobData } from '../queues/whatsapp.queue';
import logger from '../utils/logger';

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Starting Isolated WhatsApp Worker Process (Puppeteer)...');

const redis = createRedisClient();
const workerConnection = createRedisClient();

const STATUS_KEY = 'whatsapp:status';
const QR_KEY = 'whatsapp:qr';

class WhatsAppWorkerManager {
  private client: any = null;
  public isReady = false;
  public isInitializing = false;
  public lastQR: string | null = null;

  async saveStateToRedis() {
    try {
      const state = JSON.stringify({
        isReady: this.isReady,
        isInitializing: this.isInitializing,
        hasQR: !!this.lastQR,
        updatedAt: new Date().toISOString()
      });
      await redis.set(STATUS_KEY, state);
      if (this.lastQR) {
        await redis.set(QR_KEY, this.lastQR, 'EX', 120);
      } else {
        await redis.del(QR_KEY);
      }
    } catch (e: any) {
      logger.warn(`⚠️ Failed to sync WhatsApp state to Redis: ${e.message}`);
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitializing) {
      logger.warn('⚠️ WhatsApp client is already initializing...');
      return;
    }

    if (this.isReady) {
      logger.info('✅ WhatsApp client is already ready');
      return;
    }

    this.isInitializing = true;
    await this.saveStateToRedis();
    logger.info('🔄 Initializing WhatsApp Web client in isolated worker process...');

    try {
      if (this.client) {
        await this.client.destroy();
        this.client = null;
      }

      this.client = new Client({
        authStrategy: new LocalAuth({
          name: 'icsrt-whatsapp-session'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        }
      });

      this.client.on('qr', async (qr: string) => {
        logger.info('📱 WhatsApp QR Code generated:');
        qrcode.generate(qr, { small: true });
        this.lastQR = qr;
        await this.saveStateToRedis();
      });

      this.client.on('ready', async () => {
        logger.success('✅ WhatsApp client is ready and connected!');
        this.isReady = true;
        this.isInitializing = false;
        this.lastQR = null;
        await this.saveStateToRedis();
      });

      this.client.on('authenticated', () => {
        logger.info('🔐 WhatsApp client authenticated successfully');
      });

      this.client.on('auth_failure', async (msg: any) => {
        logger.error(`❌ WhatsApp authentication failed: ${JSON.stringify(msg)}`);
        this.isInitializing = false;
        this.isReady = false;
        await this.saveStateToRedis();
      });

      this.client.on('disconnected', async (reason: any) => {
        logger.warn(`🔌 WhatsApp client disconnected: ${reason}`);
        this.isReady = false;
        this.isInitializing = false;
        await this.saveStateToRedis();
      });

      await this.client.initialize();
    } catch (error: any) {
      logger.error(`❌ Failed to initialize WhatsApp client: ${error.message}`);
      this.isInitializing = false;
      this.isReady = false;
      await this.saveStateToRedis();
    }
  }

  formatPhoneNumber(phone: string): string | null {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return null;

    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }

    if (cleaned.length === 11 && cleaned.startsWith('01')) {
      cleaned = '2' + cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith('1')) {
      cleaned = '20' + cleaned;
    }

    return `${cleaned}@c.us`;
  }

  async sendMessage(phoneNumber: string, message: string): Promise<any> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp service is not ready. Please link device via QR code first.');
    }

    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }

    logger.info(`📱 Sending WhatsApp message to ${formattedNumber}...`);
    const result = await this.client.sendMessage(formattedNumber, message);
    logger.success(`✅ WhatsApp message delivered to ${formattedNumber}`);
    return result;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
      this.isInitializing = false;
      this.lastQR = null;
      await this.saveStateToRedis();
      logger.info('🔌 WhatsApp client destroyed and disconnected');
    }
  }
}

const manager = new WhatsAppWorkerManager();

// Automatically initialize WhatsApp client on worker startup
manager.initialize().catch((err) => {
  logger.error(`❌ Auto-initialization error: ${err.message}`);
});

// Process jobs from BullMQ
export const whatsappWorker = new Worker<WhatsAppJobData>(
  'whatsappQueue',
  async (job: Job<WhatsAppJobData>) => {
    const { type, phoneNumber, message } = job.data;
    logger.info(`🔄 Processing WhatsApp job ${job.id} of type "${type}"...`);

    switch (type) {
      case 'send_message':
        if (!phoneNumber || !message) throw new Error('Phone number and message required');
        await manager.sendMessage(phoneNumber, message);
        break;

      case 'initialize':
        await manager.initialize();
        break;

      case 'disconnect':
        await manager.disconnect();
        break;

      default:
        throw new Error(`Unknown WhatsApp job type: ${type}`);
    }

    return { success: true, type, phoneNumber };
  },
  {
    connection: workerConnection,
    concurrency: 1 // Process WhatsApp messages sequentially to respect rate limits
  }
);

whatsappWorker.on('completed', (job) => {
  logger.info(`✨ WhatsApp job ${job.id} completed successfully`);
});

whatsappWorker.on('failed', (job, err) => {
  logger.error(`❌ WhatsApp job ${job?.id} failed: ${err.message}`);
});

const shutdown = async () => {
  logger.info('🛑 Shutting down WhatsApp Worker process...');
  await manager.disconnect();
  await whatsappWorker.close();
  await workerConnection.quit();
  await redis.quit();
  logger.info('👋 WhatsApp Worker process terminated cleanly.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default whatsappWorker;
