import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME || 'icsrt_main';

export async function applyIndexes() {
  console.log('\n======================================================');
  console.log('⚡ APPLYING EMPIRICALLY JUSTIFIED MONGODB INDEXES');
  console.log('======================================================\n');

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 15000
  });

  const createdIndexes: Array<{ collection: string; indexName: string; keys: any; unique?: boolean }> = [];

  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`📡 Connected to database: "${db.databaseName}"\n`);

    async function ensureIndex(
      colName: string,
      keys: Record<string, 1 | -1 | 'text'>,
      options: { name?: string; unique?: boolean; sparse?: boolean } = {}
    ) {
      const col = db.collection(colName);
      try {
        const indexName = await col.createIndex(keys as any, options);
        createdIndexes.push({
          collection: colName,
          indexName,
          keys,
          unique: !!options.unique
        });
        console.log(`✅ [${colName}] Index "${indexName}" ensured -> Keys: ${JSON.stringify(keys)}${options.unique ? ' (UNIQUE)' : ''}`);
      } catch (err: any) {
        console.error(`❌ [${colName}] Failed creating index on ${JSON.stringify(keys)}: ${err.message}`);
      }
    }

    // 1. Users Collection
    console.log('📦 1. Indexing "users" collection...');
    await ensureIndex('users', { email: 1 }, { unique: true, name: 'idx_users_email_unique' });
    await ensureIndex('users', { role: 1, createdAt: -1 }, { name: 'idx_users_role_createdAt' });

    // 2. Service Orders Collection
    console.log('\n📦 2. Indexing "service_orders" collection...');
    await ensureIndex('service_orders', { orderNumber: 1 }, { unique: true, name: 'idx_service_orders_orderNumber_unique' });
    await ensureIndex('service_orders', { userEmail: 1, createdAt: -1 }, { name: 'idx_service_orders_userEmail_createdAt' });
    await ensureIndex('service_orders', { status: 1, createdAt: -1 }, { name: 'idx_service_orders_status_createdAt' });
    await ensureIndex('service_orders', { createdAt: -1 }, { name: 'idx_service_orders_createdAt' });

    // 3. Tickets Collection
    console.log('\n📦 3. Indexing "tickets" collection...');
    await ensureIndex('tickets', { ticketId: 1 }, { unique: true, sparse: true, name: 'idx_tickets_ticketId_unique' });
    await ensureIndex('tickets', { userEmail: 1, createdAt: -1 }, { name: 'idx_tickets_userEmail_createdAt' });
    await ensureIndex('tickets', { status: 1, createdAt: -1 }, { name: 'idx_tickets_status_createdAt' });
    await ensureIndex('tickets', { createdAt: -1 }, { name: 'idx_tickets_createdAt' });

    // 4. Research Articles Collection
    console.log('\n📦 4. Indexing "research_articles" collection...');
    await ensureIndex('research_articles', { status: 1, createdAt: -1 }, { name: 'idx_articles_status_createdAt' });
    await ensureIndex('research_articles', { category: 1, createdAt: -1 }, { name: 'idx_articles_category_createdAt' });
    await ensureIndex('research_articles', { createdAt: -1 }, { name: 'idx_articles_createdAt' });

    // 5. Contacts Collection
    console.log('\n📦 5. Indexing "contacts" collection...');
    await ensureIndex('contacts', { status: 1, createdAt: -1 }, { name: 'idx_contacts_status_createdAt' });
    await ensureIndex('contacts', { createdAt: -1 }, { name: 'idx_contacts_createdAt' });

    // 6. Services Collection
    console.log('\n📦 6. Indexing "services" collection...');
    await ensureIndex('services', { category: 1, createdAt: -1 }, { name: 'idx_services_category_createdAt' });

    // 7. Coupons Collection
    console.log('\n📦 7. Indexing "coupons" collection...');
    await ensureIndex('coupons', { code: 1 }, { unique: true, name: 'idx_coupons_code_unique' });

    // 8. Newsletter Collection
    console.log('\n📦 8. Indexing "newsletter" collection...');
    await ensureIndex('newsletter', { email: 1 }, { unique: true, name: 'idx_newsletter_email_unique' });

    console.log('\n======================================================');
    console.log(`🎉 COMPLETED: ${createdIndexes.length} INDEXES ENSURED SUCCESSFULLY!`);
    console.log('======================================================\n');

  } catch (err: any) {
    console.error('❌ Failed applying indexes:', err);
    throw err;
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  applyIndexes().catch(() => process.exit(1));
}
