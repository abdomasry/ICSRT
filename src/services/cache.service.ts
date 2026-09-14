import { redisConnection, isRedisAvailable } from '../config/redis';
import logger from '../utils/logger';

export const CACHE_TTL = {
  CMS_COLLECTION: 1800, // 30 minutes
  SERVICES: 1800,       // 30 minutes
  ARTICLES: 900,        // 15 minutes
  DEFAULT: 600          // 10 minutes
};

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    if (!isRedisAvailable()) return null;
    try {
      const data = await redisConnection.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch (err: any) {
      logger.warn(`⚠️ Cache GET failed for key "${key}": ${err.message}`);
    }
    return null;
  }

  async set(key: string, value: any, ttlSeconds: number = CACHE_TTL.DEFAULT): Promise<boolean> {
    if (!isRedisAvailable()) return false;
    try {
      const serialized = JSON.stringify(value);
      await redisConnection.setex(key, ttlSeconds, serialized);
      return true;
    } catch (err: any) {
      logger.warn(`⚠️ Cache SET failed for key "${key}": ${err.message}`);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!isRedisAvailable()) return false;
    try {
      await redisConnection.del(key);
      return true;
    } catch (err: any) {
      logger.warn(`⚠️ Cache DEL failed for key "${key}": ${err.message}`);
      return false;
    }
  }

  async delByPattern(pattern: string): Promise<number> {
    if (!isRedisAvailable()) return 0;
    try {
      let cursor = '0';
      let deletedCount = 0;
      do {
        const [nextCursor, keys] = await redisConnection.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys && keys.length > 0) {
          await redisConnection.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');
      return deletedCount;
    } catch (err: any) {
      logger.warn(`⚠️ Cache DEL by pattern failed for "${pattern}": ${err.message}`);
      return 0;
    }
  }

  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = CACHE_TTL.DEFAULT): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const freshData = await fetchFn();
    if (freshData !== null && freshData !== undefined) {
      await this.set(key, freshData, ttlSeconds);
    }
    return freshData;
  }
}

export const cacheService = new CacheService();
export default cacheService;
