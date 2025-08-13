// Quick test to start server and check API
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

let db;

async function connectDB() {
  if (!db) {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
  }
  return db;
}

// Get user phone number by email
app.get('/api/users/phone/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log(`🔍 Phone lookup request for: ${email}`);
    
    const database = await connectDB();
    const user = await database.collection('users').findOne(
      { email: email.toLowerCase() },
      { projection: { phone: 1, fullName: 1, email: 1 } }
    );

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    console.log(`📱 User found: ${user.fullName} - Phone: ${user.phone || 'Not available'}`);

    res.json({
      success: true,
      user: {
        phone: user.phone,
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ User phone lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lookup user phone',
      code: 'LOOKUP_ERROR'
    });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Quick test server running on port ${port}`);
  console.log(`📞 Test Marco's phone: http://localhost:${port}/api/users/phone/ilv2dtagin@wyoxafp.com`);
});
