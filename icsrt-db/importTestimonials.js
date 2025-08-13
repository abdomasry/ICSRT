const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("icsrt");
    const testimonials = db.collection("testimonials");

    const data = JSON.parse(fs.readFileSync('icsrt_testimonials.json', 'utf8'));
    const result = await testimonials.insertMany(data);
    console.log(`${result.insertedCount} testimonials inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting testimonials:", err);
  } finally {
    await client.close();
  }
}

run();
