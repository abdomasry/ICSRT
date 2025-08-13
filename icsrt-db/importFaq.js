const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("icsrt");
    const faq = db.collection("faq");

    const data = JSON.parse(fs.readFileSync('icsrt_faq.json', 'utf8'));
    const result = await faq.insertMany(data);
    console.log(`${result.insertedCount} FAQs inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting FAQs:", err);
  } finally {
    await client.close();
  }
}

run();
