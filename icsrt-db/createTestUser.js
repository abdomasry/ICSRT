const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function createTestUser() {
  await client.connect();
  const db = client.db("icsrt");
  
  const user = {
    fullName: "Test User",
    email: "test@example.com",
    password: await bcrypt.hash("test123", 10),
    phone: "+1234567890",
    institution: "Test University",
    country: "Test Country",
    bio: "Test user for development",
    isVerified: true,
    createdAt: new Date()
  };
  
  const existing = await db.collection("users").findOne({ email: user.email });
  if (existing) {
    console.log("Test user already exists:", existing.email);
  } else {
    await db.collection("users").insertOne(user);
    console.log("Test user created:");
    console.log("Email:", user.email);
    console.log("Password: test123");
  }
  await client.close();
}

createTestUser().catch(console.error);
