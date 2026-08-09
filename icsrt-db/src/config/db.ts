import { MongoClient, Db } from 'mongodb';
import { MONGODB_URI, DATABASE_NAME } from './env';

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
                console.log('🔄 Connection stale, reconnecting...');
            }
        }

        isConnecting = true;
        connectionPromise = new Promise(async (resolve, reject) => {
            let lastError: any;
            for (let i = 0; i < retries; i++) {
                try {
                    console.log(`📡 Connecting to MongoDB (attempt ${i + 1}/${retries})...`);
                    if (client) {
                        try {
                            await client.close();
                        } catch (closeError: any) {
                            console.warn('⚠️ Error closing client:', closeError.message);
                        }
                    }

                    client = new MongoClient(MONGODB_URI, {
                        maxPoolSize: 10,
                        serverSelectionTimeoutMS: 5000,
                        socketTimeoutMS: 45000,
                        connectTimeoutMS: 10000,
                        retryWrites: true,
                        retryReads: true,
                        tlsAllowInvalidCertificates: true
                    });

                    await client.connect();
                    db = client.db(DATABASE_NAME);
                    await db.command({ ping: 1 });
                    console.log(`✅ Connected to MongoDB - Database: ${DATABASE_NAME}`);

                    client.on('close', () => {
                        console.warn('⚠️ MongoDB connection closed');
                        db = null;
                    });

                    client.on('error', (error) => {
                        console.error('❌ MongoDB connection error:', error);
                        db = null;
                    });

                    resolve(db);
                    return;
                } catch (error: any) {
                    lastError = error;
                    console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, error.message);
                    if (i < retries - 1) {
                        await new Promise(r => setTimeout(r, interval));
                    }
                }
            }
            reject(new Error(`Failed to connect to MongoDB after ${retries} attempts. Last error: ${lastError?.message}`));
        });

        return await connectionPromise;
    } catch (error) {
        console.error('❌ Fatal MongoDB connection error:', error);
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

process.on('SIGINT', async () => {
    try {
        if (client) {
            console.log('Closing MongoDB connection...');
            await client.close();
            console.log('MongoDB connection closed.');
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
    process.exit(0);
});
