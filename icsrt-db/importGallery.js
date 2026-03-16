const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("icsrt");
    const gallery = db.collection("gallery");

    const data = JSON.parse(fs.readFileSync('icsrt_gallery.json', 'utf8'));
    const result = await gallery.insertMany(data);
    console.log(`${result.insertedCount} gallery items inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting gallery items:", err);
  } finally {
    await client.close();
  }
}

run();
