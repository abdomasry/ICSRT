// Debug Marco's user data
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function debugMarcoUser() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    const email = 'ilv2dtagin@wyoxafp.com';
    console.log(`🔍 Searching for user with email: ${email}`);
    
    // Try exact match
    const exactUser = await db.collection('users').findOne({ email: email });
    console.log('📋 Exact email match:', exactUser ? {
      _id: exactUser._id,
      fullName: exactUser.fullName,
      email: exactUser.email,
      phone: exactUser.phone,
      createdAt: exactUser.createdAt
    } : 'NOT FOUND');
    
    // Try case-insensitive match
    const caseInsensitiveUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    console.log('📋 Case-insensitive match:', caseInsensitiveUser ? {
      _id: caseInsensitiveUser._id,
      fullName: caseInsensitiveUser.fullName,
      email: caseInsensitiveUser.email,
      phone: caseInsensitiveUser.phone,
      createdAt: caseInsensitiveUser.createdAt
    } : 'NOT FOUND');
    
    // Search by name "Marco"
    const marcoUsers = await db.collection('users').find({ 
      fullName: { $regex: /marco/i } 
    }).toArray();
    console.log('\n👤 Users with "Marco" in name:');
    marcoUsers.forEach((user, i) => {
      console.log(`${i+1}. ID: ${user._id}`);
      console.log(`   Name: ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone || 'NOT SET'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Show all users to see the data structure
    const allUsers = await db.collection('users').find({}).limit(5).toArray();
    console.log('📊 Sample users in database:');
    allUsers.forEach((user, i) => {
      console.log(`${i+1}. ${user.fullName || 'NO NAME'} - ${user.email || 'NO EMAIL'} - Phone: ${user.phone || 'NOT SET'}`);
    });
    
    // Check contact requests that might be related to Marco
    const marcoContacts = await db.collection('contact_requests').find({
      $or: [
        { email: email },
        { email: email.toLowerCase() },
        { name: { $regex: /marco/i } }
      ]
    }).toArray();
    
    console.log('\n📧 Contact requests from Marco:');
    marcoContacts.forEach((contact, i) => {
      console.log(`${i+1}. Name: ${contact.name}`);
      console.log(`   Email: ${contact.email}`);
      console.log(`   Phone: ${contact.phone || 'NOT SET'}`);
      console.log(`   UserId: ${contact.userId || 'NOT SET'}`);
      console.log(`   Date: ${contact.timestamp || contact.createdAt}`);
      console.log('');
    });
    
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugMarcoUser();
