/**
 * Normalize legacy userType values for existing users
 * - Maps various old strings to the new combined categories:
 *   - student_academic
 *   - researcher_professional
 * - Preserves original value in userTypeOriginal (first time only)
 * - Adds markers: userTypeNormalized: true and userTypeNormalizedAt timestamp
 *
 * Safe to run multiple times (idempotent):
 * - Skips users already normalized with the same value
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Reuse server defaults if env not provided
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = process.env.DATABASE_NAME || 'icsrt_main';

function normalizeUserType(ut) {
  if (!ut) return null; // don't force a value when absent
  const s = String(ut).toLowerCase().trim();
  if (s === 'student_academic' || s === 'researcher_professional') return s;
  // Common legacy patterns
  if (s.includes('student') || s.includes('academic') || s === 'academia') return 'student_academic';
  if (
    s.includes('research') ||
    s.includes('professional') ||
    s.startsWith('prof') || // professor/professional
    s.includes('lectur') ||
    s.includes('engineer') ||
    s.includes('scientist') ||
    s.includes('doctor')
  ) return 'researcher_professional';
  return null; // unrecognized -> leave as-is
}

async function run() {
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 8000,
  });

  let updated = 0;
  let skipped = 0;
  let examined = 0;

  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const users = db.collection('users');

    // Find candidates: either have a non-canonical userType, or missing but possibly derivable
    const cursor = users.find({}, { projection: { _id: 1, userType: 1, role: 1 } });
    const bulk = [];

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      examined++;

      const current = doc.userType;
      const normalized = normalizeUserType(current);

      // If already canonical and matches, skip
      if (current === 'student_academic' || current === 'researcher_professional') {
        skipped++;
        continue;
      }

      // If we can map it, update; otherwise skip to avoid incorrect assignment
      if (normalized) {
        bulk.push({
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: {
                userType: normalized,
                userTypeNormalized: true,
                userTypeNormalizedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              // Preserve original value if present
              ...(current !== undefined ? { $set: { userTypeOriginal: current } } : {}),
            },
          },
        });
      } else {
        skipped++;
      }
    }

    if (bulk.length > 0) {
      const result = await users.bulkWrite(bulk, { ordered: false });
      updated = (result.modifiedCount || 0) + (result.upsertedCount || 0);
    }

    console.log('— Normalize user types —');
    console.log('Database:', DATABASE_NAME);
    console.log('Examined:', examined);
    console.log('Updated:', updated);
    console.log('Skipped:', skipped);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => {});
  }
}

run();
