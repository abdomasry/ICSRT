
const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("icsrt");
    const journals = database.collection("journals");

    const data = JSON.parse(fs.readFileSync('icsrt_journals.json', 'utf8'));

    const result = await journals.insertMany(data);
    console.log(`${result.insertedCount} journals inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting journals:", err);
  } finally {
    await client.close();
  }
}

run();
