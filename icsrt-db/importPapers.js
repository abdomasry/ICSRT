
const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("icsrt");
    const papers = database.collection("papers");

    const data = JSON.parse(fs.readFileSync('icsrt_papers.json', 'utf8'));

    const result = await papers.insertMany(data);
    console.log(`${result.insertedCount} papers inserted successfully.`);
  } catch (err) {
    console.error("❌ Error inserting papers:", err);
  } finally {
    await client.close();
  }
}

run();
