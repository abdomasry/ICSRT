const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("icsrt");
    const news = db.collection("news");

    const data = JSON.parse(fs.readFileSync('icsrt_news.json', 'utf8'));
    const result = await news.insertMany(data);
    console.log(`${result.insertedCount} news articles inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting news:", err);
  } finally {
    await client.close();
  }
}

run();
