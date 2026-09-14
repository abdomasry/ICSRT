import { Worker, Job } from 'bullmq';
import { createRedisClient } from '../config/redis';
import { EmailJobData } from '../queues/email.queue';
import { sendEmailDirect, sendVerificationEmailDirect, sendPasswordResetEmailDirect } from '../services/email.service';
import logger from '../utils/logger';

console.log('🚀 Starting ICSRT Email Worker Process...');

const workerConnection = createRedisClient();

export const emailWorker = new Worker<EmailJobData>(
  'emailQueue',
  async (job: Job<EmailJobData>) => {
    const { type, email, token, name, subject, html, text } = job.data;
    logger.info(`🔄 Processing email job ${job.id} of type "${type}" for ${email}...`);

    switch (type) {
      case 'verification':
        if (!token) throw new Error('Verification token missing in email job');
        await sendVerificationEmailDirect(email, token, name);
        break;

      case 'password_reset':
        if (!token) throw new Error('Password reset token missing in email job');
        await sendPasswordResetEmailDirect(email, token, name);
        break;

      case 'generic':
        if (!subject || !html) throw new Error('Subject or HTML content missing in generic email job');
        await sendEmailDirect({ to: email, subject, html, text });
        break;

      default:
        throw new Error(`Unknown email job type: ${type}`);
    }

    logger.success(`✅ Successfully delivered email job ${job.id} to ${email}`);
    return { success: true, email, type };
  },
  {
    connection: workerConnection,
    concurrency: 5
  }
);

emailWorker.on('completed', (job) => {
  logger.info(`✨ Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`❌ Email job ${job?.id} failed with error: ${err.message} (Attempt ${job?.attemptsMade}/${job?.opts.attempts})`);
});

emailWorker.on('error', (err) => {
  logger.error(`🔥 Email worker error: ${err.message}`);
});

// Graceful shutdown handling
const shutdown = async () => {
  logger.info('🛑 Shutting down Email Worker gracefully...');
  await emailWorker.close();
  await workerConnection.quit();
  logger.info('👋 Email Worker closed cleanly.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default emailWorker;
