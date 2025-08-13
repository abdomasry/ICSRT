
const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("icsrt");
    const contacts = database.collection("contacts");

    const data = JSON.parse(fs.readFileSync('icsrt_contacts.json', 'utf8'));

    const result = await contacts.insertMany(data);
    console.log(`${result.insertedCount} contact inquiries inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting contact inquiries:", err);
  } finally {
    await client.close();
  }
}

run();
