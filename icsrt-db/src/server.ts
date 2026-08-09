import app from './app';
import { PORT } from './config/env';
import { connectWithRetry } from './config/db';
import logger from './utils/logger';

async function startServer() {
  try {
    logger.info('🚀 Starting ICSRT Backend Server (TypeScript)...');
    
    await connectWithRetry(5, 3000);

    app.listen(PORT, '0.0.0.0', () => {
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

startServer();
