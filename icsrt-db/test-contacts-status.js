const { MongoClient } = require('mongodb');

async function testContactsAPI() {
    try {
        console.log('🔍 Testing MongoDB connection...');
        
        const mongoURI = "mongodb+srv://abdoeldeep30:YkpYIjW7cV@icsrt.cgphk.mongodb.net/icsrt_main?retryWrites=true&w=majority";
        const client = new MongoClient(mongoURI);
        
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('icsrt_main');
        const contacts = await db.collection('contact-requests').find({}).toArray();
        
        console.log(`📊 Found ${contacts.length} contact messages in database`);
        
        if (contacts.length > 0) {
            console.log('📄 Latest contact:');
            console.log(`  Name: ${contacts[0].name}`);
            console.log(`  Email: ${contacts[0].email}`);
            console.log(`  Subject: ${contacts[0].subject}`);
        }
        
        await client.close();
        
        // Test API endpoint
        console.log('\n🌐 Testing API endpoint...');
        const response = await fetch('http://localhost:3000/api/contacts');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API endpoint working');
            console.log(`📊 API returned ${data.data ? data.data.length : 0} contacts`);
        } else {
            console.log('❌ API endpoint not responding');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testContactsAPI();
