// Simple MongoDB connection test with inline credentials check
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/";
const DB_NAME = "icsrt_main";

async function checkCredentials() {
    console.log("Starting credential check...");
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log("✓ Connected to MongoDB");
        
        const db = client.db(DB_NAME);
        const admins = await db.collection('admins').find({}).toArray();
        
        console.log(`Found ${admins.length} admin accounts:`);
        
        for (const admin of admins) {
            console.log(`\nAdmin: ${admin.username}`);
            console.log(`Email: ${admin.email}`);
            console.log(`Role: ${admin.role}`);
            console.log(`Has password: ${admin.password ? 'Yes' : 'No'}`);
            
            // Test the passwords we created
            const testPasswords = ['super123', 'content123', 'user123', 'view123'];
            for (const testPassword of testPasswords) {
                const isMatch = await bcrypt.compare(testPassword, admin.password);
                if (isMatch) {
                    console.log(`✓ Password "${testPassword}" works for ${admin.username}`);
                    break;
                }
            }
        }
        
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await client.close();
        console.log("Database connection closed");
    }
}

checkCredentials().catch(console.error);
