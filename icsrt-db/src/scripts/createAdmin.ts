import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

dotenv.config();

async function main() {
  const [emailInput, password] = process.argv.slice(2);
  const uri = process.env.MONGODB_URI;
  if (!uri || !emailInput || !password) {
    throw new Error('Set MONGODB_URI and pass an email and password.');
  }
  const email = emailInput.trim().toLowerCase();
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const users = client.db(process.env.DATABASE_NAME || 'icsrt_main').collection('users');
    if (await users.findOne({ email }, { projection: { _id: 1 } })) {
      throw new Error('Account already exists; no changes made.');
    }
    const now = new Date();
    const result = await users.insertOne({
      email, name: 'Super Administrator', role: 'super_admin',
      password: await bcrypt.hash(password, 12), isVerified: true,
      createdAt: now, updatedAt: now
    });
    const saved = await users.findOne({ _id: result.insertedId });
    if (!saved || saved.role !== 'super_admin' || !(await bcrypt.compare(password, saved.password))) {
      throw new Error('Account verification failed.');
    }
    console.log(`Created and verified administrator: ${email}`);
  } finally {
    await client.close();
  }
}

main().catch(error => {
  // Avoid printing connection strings or driver diagnostics containing secrets.
  console.error(error instanceof Error && ['Account already exists; no changes made.', 'Set MONGODB_URI and pass an email and password.', 'Account verification failed.'].includes(error.message)
    ? error.message : 'Database operation failed. Check connection access and credentials.');
  process.exitCode = 1;
});
