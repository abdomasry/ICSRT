const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/";
const DB_NAME = "icsrt_main";

async function checkAndSave() {
    const results = [];
    results.push("=== ICSRT Admin Credentials Check ===");
    results.push(`Timestamp: ${new Date().toISOString()}`);
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        results.push("✓ Connected to MongoDB successfully");
        
        const db = client.db(DB_NAME);
        
        // Check admin collection
        const admins = await db.collection('admins').find({}).toArray();
        results.push(`Found ${admins.length} admin accounts in database`);
        
        if (admins.length === 0) {
            results.push("❌ NO ADMIN ACCOUNTS FOUND - Need to run rebuild-rbac.js");
        }
        
        for (const admin of admins) {
            results.push(`\n--- Admin Account ---`);
            results.push(`Username: ${admin.username}`);
            results.push(`Email: ${admin.email}`);
            results.push(`Role: ${admin.role}`);
            results.push(`Password Hash Present: ${admin.password ? 'Yes' : 'No'}`);
            
            // Test expected passwords
            const expectedPasswords = {
                'superadmin': 'super123',
                'contenteditor': 'content123', 
                'usermanager': 'user123',
                'contentviewer': 'view123'
            };
            
            const expectedPassword = expectedPasswords[admin.username];
            if (expectedPassword && admin.password) {
                try {
                    const isValid = await bcrypt.compare(expectedPassword, admin.password);
                    results.push(`Password "${expectedPassword}": ${isValid ? '✓ VALID' : '❌ INVALID'}`);
                } catch (err) {
                    results.push(`Password check error: ${err.message}`);
                }
            }
        }
        
        // Check roles collection
        const roles = await db.collection('roles').find({}).toArray();
        results.push(`\nFound ${roles.length} roles in database`);
        for (const role of roles) {
            results.push(`Role: ${role.name} (${role.permissions.length} permissions)`);
        }
        
    } catch (error) {
        results.push(`❌ Error: ${error.message}`);
    } finally {
        await client.close();
    }
    
    // Write to file
    const outputFile = 'credential-check-results.txt';
    fs.writeFileSync(outputFile, results.join('\n'));
    console.log(`Results saved to ${outputFile}`);
}

checkAndSave().catch(err => {
    fs.writeFileSync('credential-check-error.txt', `Error: ${err.message}\nStack: ${err.stack}`);
    console.log('Error occurred, check credential-check-error.txt');
});
