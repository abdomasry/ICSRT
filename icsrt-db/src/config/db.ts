import { MongoClient, Db } from 'mongodb';
import { MONGODB_URI, DATABASE_NAME } from './env';
import logger from '../utils/logger';

let db: Db | null = null;
let client: MongoClient | null = null;
let isConnecting = false;
let connectionPromise: Promise<Db> | null = null;

export async function connectWithRetry(retries = 5, interval = 5000): Promise<Db> {
    try {
        if (isConnecting && connectionPromise) {
            return connectionPromise;
        }

        if (db) {
            try {
                await db.command({ ping: 1 });
                return db;
            } catch (pingError) {
                logger.info('🔄 Connection stale, reconnecting...');
            }
        }

        isConnecting = true;
        connectionPromise = new Promise(async (resolve, reject) => {
            let lastError: any;
            for (let i = 0; i < retries; i++) {
                try {
                    logger.info(`📡 Connecting to MongoDB (attempt ${i + 1}/${retries})...`);
                    if (client) {
                        try {
                            await client.close();
                        } catch (closeError: any) {
                            logger.warn(`⚠️ Error closing client: ${closeError.message}`);
                        }
                    }

                    client = new MongoClient(MONGODB_URI, {
                        maxPoolSize: 20,
                        minPoolSize: 2,
                        serverSelectionTimeoutMS: 8000,
                        socketTimeoutMS: 30000,
                        connectTimeoutMS: 8000,
                        retryWrites: true,
                        retryReads: true,
                        tlsAllowInvalidCertificates: true
                    });

                    await client.connect();
                    db = client.db(DATABASE_NAME);
                    await db.command({ ping: 1 });
                    logger.info(`✅ Connected to MongoDB - Database: ${DATABASE_NAME}`);

                    client.on('close', () => {
                        logger.warn('⚠️ MongoDB connection closed');
                        db = null;
                    });

                    client.on('error', (error) => {
                        logger.error('❌ MongoDB connection error:', error);
                        db = null;
                    });

                    resolve(db);
                    return;
                } catch (error: any) {
                    lastError = error;
                    logger.error(`❌ MongoDB connection attempt ${i + 1} failed: ${error.message}`);
                    if (i < retries - 1) {
                        await new Promise(r => setTimeout(r, interval));
                    }
                }
            }
            reject(new Error(`Failed to connect to MongoDB after ${retries} attempts. Last error: ${lastError?.message}`));
        });

        return await connectionPromise;
    } catch (error) {
        logger.error('❌ Fatal MongoDB connection error:', error);
        throw error;
    } finally {
        isConnecting = false;
        connectionPromise = null;
    }
}

export async function getDB(): Promise<Db> {
    if (db) return db;
    return await connectWithRetry();
}

export function getClient(): MongoClient | null {
    return client;
}

export async function isDBConnected(): Promise<boolean> {
    if (!db) return false;
    try {
        await db.command({ ping: 1 });
        return true;
    } catch (e) {
        return false;
    }
}

export async function closeDB(): Promise<void> {
    if (client) {
        try {
            await client.close();
            db = null;
            client = null;
            logger.info('🔌 MongoDB connection closed cleanly.');
        } catch (err: any) {
            logger.error('❌ Error closing MongoDB connection:', err);
        }
    }
}
