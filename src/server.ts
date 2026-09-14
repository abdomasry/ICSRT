import http from 'http';
import app from './app';
import { PORT } from './config/env';
import { connectWithRetry, closeDB } from './config/db';
import { closeRedis } from './config/redis';
import { emailQueue } from './queues/email.queue';
import { whatsappQueue } from './queues/whatsapp.queue';
import logger from './utils/logger';

let server: http.Server | null = null;
let isShuttingDown = false;

async function startServer() {
  try {
    logger.info('🚀 Starting ICSRT Backend Server (TypeScript)...');
    
    await connectWithRetry(5, 3000);

    server = app.listen(PORT, '0.0.0.0', () => {
      logger.success(`=================================================`);
      logger.success(`  ICSRT TypeScript Backend Server Running`);
      logger.success(`  URL: http://localhost:${PORT}`);
      logger.success(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.success(`=================================================`);
    });

  } catch (error: any) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new HTTP requests
  if (server) {
    await new Promise<void>((resolve) => {
      server!.close((err) => {
        if (err) {
          logger.warn(`⚠️ Error closing HTTP server: ${err.message}`);
        } else {
          logger.info('🛑 HTTP server stopped accepting connections.');
        }
        resolve();
      });
    });
  }

  // Close queues
  try {
    await emailQueue.close();
    await whatsappQueue.close();
    logger.info('🛑 BullMQ queues closed.');
  } catch (e: any) {
    logger.warn(`⚠️ Error closing queues: ${e.message}`);
  }

  // Close Redis connection
  await closeRedis();

  // Close MongoDB connection
  await closeDB();

  logger.success('👋 Graceful shutdown complete. Process exiting cleanly.\n');
  process.exit(0);
}

// Process signal listeners
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Process error boundaries
process.on('unhandledRejection', (reason: any) => {
  logger.error('🔥 [Unhandled Promise Rejection]:', {
    message: reason?.message || String(reason),
    stack: reason?.stack || 'No stack trace'
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('🔥 [Uncaught Exception]:', {
    message: error.message,
    stack: error.stack
  });
  gracefulShutdown('uncaughtException').catch(() => process.exit(1));
});

startServer();
