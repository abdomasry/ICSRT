const { MongoClient } = require("mongodb");
require('dotenv').config();

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = process.env.DATABASE_NAME || "icsrt_main";

let db;
let client;
let isConnecting = false;
let connectionPromise = null;

async function connectWithRetry(retries = 5, interval = 5000) {
    try {
        if (isConnecting) {
            return connectionPromise;
        }

        if (db) {
            try {
                // Test the connection with a simple command
                await db.command({ ping: 1 });
                return db;
            } catch (pingError) {
                console.log('🔄 Existing connection is stale, reconnecting...');
                // Continue to reconnection logic if ping fails
            }
        }

        isConnecting = true;
        connectionPromise = new Promise(async (resolve, reject) => {
            let lastError;
            
            for (let i = 0; i < retries; i++) {
                try {
                    console.log(`📡 Attempting to connect to MongoDB (attempt ${i + 1}/${retries})...`);
                    
                    if (client) {
                        try {
                            await client.close();
                        } catch (closeError) {
                            console.warn('⚠️ Error closing existing client:', closeError.message);
                        }
                    }

                    client = new MongoClient(MONGODB_URI, {
                        maxPoolSize: 10,
                        serverSelectionTimeoutMS: 5000,
                        socketTimeoutMS: 45000,
                        connectTimeoutMS: 10000,
                        retryWrites: true,
                        retryReads: true,
                    });

                    await client.connect();
                    db = client.db(DATABASE_NAME);
                    
                    // Verify connection with ping
                    await db.command({ ping: 1 });
                    
                    console.log(`✅ Connected to MongoDB Atlas - Database: ${DATABASE_NAME}`);
                    
                    // Set up connection monitoring
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
                } catch (error) {
                    lastError = error;
                    console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, error.message);
                    
                    if (i < retries - 1) {
                        console.log(`⏳ Waiting ${interval/1000} seconds before retrying...`);
                        await new Promise(r => setTimeout(r, interval));
                    }
                }
            }
            
            reject(new Error(`Failed to connect to MongoDB after ${retries} attempts. Last error: ${lastError.message}`));
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

async function getDB() {
    return await connectWithRetry();
}

// Ensure proper cleanup on process termination
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

module.exports = {
    getDB,
    connectWithRetry
};