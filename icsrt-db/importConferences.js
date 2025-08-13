
const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection URI
const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("icsrt");
    const conferences = database.collection("conferences");

    const data = JSON.parse(fs.readFileSync('icsrt_conferences.json', 'utf8'));

    const result = await conferences.insertMany(data);
    console.log(`${result.insertedCount} conferences inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting conferences:", err);
  } finally {
    await client.close();
  }
}

run();
