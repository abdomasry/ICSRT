import { Queue, QueueOptions } from 'bullmq';
import { redisConnection, isRedisAvailable } from '../config/redis';
import { SendEmailOptions } from '../services/email.service';
import logger from '../utils/logger';

export interface EmailJobData {
  type: 'verification' | 'password_reset' | 'generic';
  email: string;
  name?: string;
  token?: string;
  subject?: string;
  html?: string;
  text?: string;
}

const queueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
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

export const emailQueue = new Queue<EmailJobData>('emailQueue', queueOptions);

emailQueue.on('error', (err: any) => {
  logger.warn(`⚠️ emailQueue Redis event: ${err.message || 'Queue connection error'}`);
});

export async function enqueueVerificationEmail(email: string, token: string, name = 'User'): Promise<{ queued: boolean; jobId?: string; error?: string }> {
  const jobData: EmailJobData = {
    type: 'verification',
    email,
    token,
    name
  };

  if (isRedisAvailable()) {
    try {
      const job = await emailQueue.add('send_verification_email', jobData);
      logger.info(`📨 Queued verification email for ${email} (Job ID: ${job.id})`);
      return { queued: true, jobId: job.id };
    } catch (err: any) {
      logger.error(`❌ Failed to enqueue verification email for ${email}: ${err.message}`);
      return { queued: false, error: err.message };
    }
  }

  logger.warn(`⚠️ Email queue is unavailable (Redis offline). Verification email for ${email} was not enqueued.`);
  return { queued: false, error: 'Redis queue is offline' };
}

export async function enqueuePasswordResetEmail(email: string, token: string, name = 'User'): Promise<{ queued: boolean; jobId?: string; error?: string }> {
  const jobData: EmailJobData = {
    type: 'password_reset',
    email,
    token,
    name
  };

  if (isRedisAvailable()) {
    try {
      const job = await emailQueue.add('send_password_reset_email', jobData);
      logger.info(`📨 Queued password reset email for ${email} (Job ID: ${job.id})`);
      return { queued: true, jobId: job.id };
    } catch (err: any) {
      logger.error(`❌ Failed to enqueue password reset email for ${email}: ${err.message}`);
      return { queued: false, error: err.message };
    }
  }

  logger.warn(`⚠️ Email queue is unavailable (Redis offline). Password reset email for ${email} was not enqueued.`);
  return { queued: false, error: 'Redis queue is offline' };
}

export async function enqueueGenericEmail(options: SendEmailOptions): Promise<{ queued: boolean; jobId?: string; error?: string }> {
  const jobData: EmailJobData = {
    type: 'generic',
    email: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  };

  if (isRedisAvailable()) {
    try {
      const job = await emailQueue.add('send_generic_email', jobData);
      logger.info(`📨 Queued generic email for ${options.to} (Job ID: ${job.id})`);
      return { queued: true, jobId: job.id };
    } catch (err: any) {
      logger.error(`❌ Failed to enqueue email for ${options.to}: ${err.message}`);
      return { queued: false, error: err.message };
    }
  }

  logger.warn(`⚠️ Email queue is unavailable (Redis offline). Email for ${options.to} was not enqueued.`);
  return { queued: false, error: 'Redis queue is offline' };
}
