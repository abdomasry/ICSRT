const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("icsrt");
    const events = db.collection("events");

    const data = JSON.parse(fs.readFileSync('icsrt_events.json', 'utf8'));
    const result = await events.insertMany(data);
    console.log(`${result.insertedCount} events inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting events:", err);
  } finally {
    await client.close();
  }
}

run();
