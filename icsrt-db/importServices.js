const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection URI
const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db("icsrt");
    const services = database.collection("services");

    const data = JSON.parse(fs.readFileSync('icsrt_services.json', 'utf8'));

    const result = await services.insertMany(data);
    console.log(`${result.insertedCount} service added successfully.`);
  } catch (err) {
    console.error("❌ Error inserting conferences:", err);
  } finally {
    await client.close();
  }
}

run();
