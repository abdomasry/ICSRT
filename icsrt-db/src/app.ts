import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import crypto from 'crypto';
import path from 'path';
import { corsOptions } from './config/cors';
import setupSecurityMiddleware from './middleware/sanitize.middleware';
import { globalLimiter } from './middleware/rateLimiter.middleware';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { isDBConnected } from './config/db';
import { isRedisAvailable } from './config/redis';

const app = express();

app.set('trust proxy', 1);

// Attach Request ID for structured tracking
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  (req as any).id = reqId;
  res.setHeader('x-request-id', reqId);
  next();
});

// High-performance gzip/deflate compression for responses > 1KB
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(cors(corsOptions));
setupSecurityMiddleware(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(globalLimiter);

// Liveness probe (Process is alive)
app.get('/health', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  res.status(200).json({
    status: 'OK',
    type: 'liveness',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      externalMb: Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100
    }
  });
});

// Readiness probe (Database & critical dependencies ready to accept traffic)
app.get('/health/readiness', async (req: Request, res: Response) => {
  const dbUp = await isDBConnected();
  const redisUp = isRedisAvailable();

  const isReady = dbUp; // MongoDB is critical dependency

  const statusCode = isReady ? 200 : 503;
  return res.status(statusCode).json({
    status: isReady ? 'READY' : 'NOT_READY',
    type: 'readiness',
    timestamp: new Date().toISOString(),
    dependencies: {
      database: dbUp ? 'connected' : 'disconnected',
      redis: redisUp ? 'connected' : 'offline_fallback'
    }
  });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
