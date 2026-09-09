import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'icsrt_main';

async function verifyLiveProductionReadiness() {
  console.log('📡 Connecting to live MongoDB Atlas database:', DATABASE_NAME);
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000, tlsAllowInvalidCertificates: true });

  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const pingResult = await db.command({ ping: 1 });
    console.log('✅ Ping result:', pingResult);

    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Found ${collections.length} collections in ${DATABASE_NAME}:`);
    
    for (const col of collections) {
      const collection = db.collection(col.name);
      const indexes = await collection.indexes();
      const count = await collection.countDocuments();
      console.log(`\n🔹 Collection: [${col.name}] (Count: ${count})`);
      indexes.forEach(idx => {
        console.log(`   - Index "${idx.name}":`, JSON.stringify(idx.key), idx.unique ? '[UNIQUE]' : '');
      });
    }

    // -------------------------------------------------------------
    // Explain Queries (Empirical Query Plan Verification)
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('🔍 EXPLAIN EXECUTION STATS ON CORE QUERIES');
    console.log('======================================================');

    // 1. users by email
    const usersCol = db.collection('users');
    const userExplain = await usersCol.find({ email: 'test@example.com' }).explain('executionStats');
    const userStage = userExplain.executionStats?.executionStages?.stage || userExplain.queryPlanner?.winningPlan?.stage;
    const userIdx = userExplain.executionStats?.executionStages?.inputStage?.indexName || userExplain.queryPlanner?.winningPlan?.inputStage?.indexName || userExplain.queryPlanner?.winningPlan?.indexName || 'COLLSCAN';
    console.log('\n1. users.find({ email: ... }):');
    console.log(`   Stage: ${userStage} | Index: ${userIdx}`);

    // 2. service_orders by orderNumber
    const ordersCol = db.collection('service_orders');
    const orderExplain = await ordersCol.find({ orderNumber: 'ORD-123' }).explain('executionStats');
    const orderStage = orderExplain.executionStats?.executionStages?.stage || orderExplain.queryPlanner?.winningPlan?.stage;
    const orderIdx = orderExplain.executionStats?.executionStages?.inputStage?.indexName || orderExplain.queryPlanner?.winningPlan?.inputStage?.indexName || orderExplain.queryPlanner?.winningPlan?.indexName || 'COLLSCAN';
    console.log('\n2. service_orders.find({ orderNumber: ... }):');
    console.log(`   Stage: ${orderStage} | Index: ${orderIdx}`);

    // 3. service_orders by userEmail + createdAt desc
    const orderUserExplain = await ordersCol.find({ userEmail: 'user@example.com' }).sort({ createdAt: -1 }).explain('executionStats');
    const orderUserStage = orderUserExplain.executionStats?.executionStages?.stage || orderUserExplain.queryPlanner?.winningPlan?.stage;
    const orderUserIdx = orderUserExplain.executionStats?.executionStages?.inputStage?.indexName || orderUserExplain.queryPlanner?.winningPlan?.inputStage?.indexName || orderUserExplain.queryPlanner?.winningPlan?.indexName || 'COLLSCAN';
    console.log('\n3. service_orders.find({ userEmail: ... }).sort({ createdAt: -1 }):');
    console.log(`   Stage: ${orderUserStage} | Index: ${orderUserIdx}`);

    // 4. tickets by userEmail + createdAt desc
    const ticketsCol = db.collection('tickets');
    const ticketExplain = await ticketsCol.find({ userEmail: 'user@example.com' }).sort({ createdAt: -1 }).explain('executionStats');
    const ticketStage = ticketExplain.executionStats?.executionStages?.stage || ticketExplain.queryPlanner?.winningPlan?.stage;
    const ticketIdx = ticketExplain.executionStats?.executionStages?.inputStage?.indexName || ticketExplain.queryPlanner?.winningPlan?.inputStage?.indexName || ticketExplain.queryPlanner?.winningPlan?.indexName || 'COLLSCAN';
    console.log('\n4. tickets.find({ userEmail: ... }).sort({ createdAt: -1 }):');
    console.log(`   Stage: ${ticketStage} | Index: ${ticketIdx}`);

    // 5. research_articles by status + createdAt desc
    const articlesCol = db.collection('research_articles');
    const articleExplain = await articlesCol.find({ status: 'published' }).sort({ createdAt: -1 }).explain('executionStats');
    const articleStage = articleExplain.executionStats?.executionStages?.stage || articleExplain.queryPlanner?.winningPlan?.stage;
    const articleIdx = articleExplain.executionStats?.executionStages?.inputStage?.indexName || articleExplain.queryPlanner?.winningPlan?.inputStage?.indexName || articleExplain.queryPlanner?.winningPlan?.indexName || 'COLLSCAN';
    console.log('\n5. research_articles.find({ status: ... }).sort({ createdAt: -1 }):');
    console.log(`   Stage: ${articleStage} | Index: ${articleIdx}`);

    // 6. contacts by status + createdAt desc
    const contactsCol = db.collection('contacts');
    const contactExplain = await contactsCol.find({ status: 'pending' }).sort({ createdAt: -1 }).explain('executionStats');
    const contactStage = contactExplain.executionStats?.executionStages?.stage || contactExplain.queryPlanner?.winningPlan?.stage;
    const contactIdx = contactExplain.executionStats?.executionStages?.inputStage?.indexName || contactExplain.queryPlanner?.winningPlan?.inputStage?.indexName || contactExplain.queryPlanner?.winningPlan?.indexName || 'COLLSCAN';
    console.log('\n6. contacts.find({ status: ... }).sort({ createdAt: -1 }):');
    console.log(`   Stage: ${contactStage} | Index: ${contactIdx}`);

  } catch (err: any) {
    console.error('❌ Error during live MongoDB verification:', err.message);
  } finally {
    await client.close();
  }
}

verifyLiveProductionReadiness();
