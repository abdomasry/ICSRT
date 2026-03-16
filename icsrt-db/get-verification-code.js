// Quick Verification Code Retriever for ICSRT
// Usage: node get-verification-code.js email@example.com

const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority';
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node get-verification-code.js email@example.com');
  process.exit(1);
}

async function getVerificationCode() {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db('icsrt_main');
    
    const user = await db.collection('users').findOne({ email: email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      client.close();
      return;
    }
    
    if (user.isVerified) {
      console.log('✅ User is already verified!');
      console.log('You can log in now.');
      client.close();
      return;
    }
    
    if (user.verificationCode) {
      console.log('🔐 Verification Code:', user.verificationCode);
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.fullName);
      
      // Check if code is expired
      if (user.verificationExpires && new Date() > new Date(user.verificationExpires)) {
        console.log('⚠️  Verification code has expired');
        console.log('Please request a new verification code');
      } else {
        console.log('✅ Code is valid and ready to use');
      }
    } else {
      console.log('❌ No verification code found for this user');
    }
    
    client.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getVerificationCode();
