import Redis, { RedisOptions } from 'ioredis';
import logger from '../utils/logger';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;
const redisUrl = process.env.REDIS_URL;

let isConnected = false;
let hasLoggedFailure = false;

export const redisOptions: RedisOptions = {
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: 5000,
  commandTimeout: 3000,
  retryStrategy(times: number) {
    if (process.env.NODE_ENV === 'test' || times > 3) {
      if (!hasLoggedFailure) {
        logger.warn('⚠️ Redis connection unavailable. Queues will operate in resilient fallback mode.');
        hasLoggedFailure = true;
      }
      return null; // Stop reconnecting in offline/test environment
    }
    return Math.min(times * 300, 2000);
  }
};

export const redisConnection: Redis = redisUrl 
  ? new Redis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true, connectTimeout: 5000, commandTimeout: 3000 }) 
  : new Redis(redisOptions);

redisConnection.on('connect', () => {
  isConnected = true;
  hasLoggedFailure = false;
  logger.success('✅ Connected to Redis successfully');
});

redisConnection.on('ready', () => {
  isConnected = true;
  logger.info('🚀 Redis client ready to accept commands');
});

redisConnection.on('error', (err: any) => {
  isConnected = false;
  if (!hasLoggedFailure) {
    logger.warn(`⚠️ Redis connection unavailable (${err.message || 'connection refused'}). Operating in resilient fallback mode.`);
    hasLoggedFailure = true;
  }
});

redisConnection.on('close', () => {
  isConnected = false;
});

// Helper to check if Redis is currently reachable
export const isRedisAvailable = (): boolean => isConnected;

// Helper to get duplicate connection for BullMQ Workers/Queues
export const createRedisClient = (): Redis => {
  return redisUrl 
    ? new Redis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true, connectTimeout: 5000, commandTimeout: 3000 }) 
    : new Redis(redisOptions);
};

export const closeRedis = async (): Promise<void> => {
  try {
    if (isConnected) {
      await redisConnection.quit();
      isConnected = false;
      logger.info('🔌 Redis connection closed cleanly.');
    }
  } catch (e: any) {
    logger.warn(`⚠️ Redis disconnect error: ${e.message}`);
  }
};

export default redisConnection;
