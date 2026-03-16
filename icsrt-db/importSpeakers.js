
const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection URI
const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("icsrt");
    const speakers = database.collection("speakers");

    const data = JSON.parse(fs.readFileSync('icsrt_speakers.json', 'utf8'));

    const result = await speakers.insertMany(data);
    console.log(`${result.insertedCount} speakers inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting speakers:", err);
  } finally {
    await client.close();
  }
}

run();
