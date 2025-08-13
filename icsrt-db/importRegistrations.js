
const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("icsrt");
    const registrations = database.collection("registrations");

    const data = JSON.parse(fs.readFileSync('icsrt_registrations.json', 'utf8'));

    const result = await registrations.insertMany(data);
    console.log(`${result.insertedCount} registrations inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting registrations:", err);
  } finally {
    await client.close();
  }
}

run();
