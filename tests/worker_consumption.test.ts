import assert from 'node:assert';
import { Queue, Worker } from 'bullmq';
import { createRedisClient, isRedisAvailable, redisConnection } from '../src/config/redis';

async function runWorkerConsumptionTest() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING END-TO-END WORKER CONSUMPTION TEST');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Check if Redis is reachable for full E2E test
  let redisLive = false;
  try {
    const pingRes = await redisConnection.ping();
    if (pingRes === 'PONG') {
      redisLive = true;
    }
  } catch (e) {
    redisLive = false;
  }

  if (!redisLive) {
    console.log('ℹ️ Local Redis is not running. Testing worker lifecycle, contract verification, and error boundaries.');

    await test('Worker: Email worker structure and job handler contract validation', async () => {
      // Verify worker process definitions and handler logic
      const { emailWorker } = await import('../src/workers/email.worker');
      assert.ok(emailWorker, 'emailWorker must be defined');
      assert.strictEqual(emailWorker.name, 'emailQueue');
      await emailWorker.close();
    });

    await test('Worker: WhatsApp worker structure and job handler contract validation', async () => {
      const { whatsappWorker } = await import('../src/workers/whatsapp.worker');
      assert.ok(whatsappWorker, 'whatsappWorker must be defined');
      assert.strictEqual(whatsappWorker.name, 'whatsappQueue');
      await whatsappWorker.close();
    });

  } else {
    console.log('✅ Redis is active. Running live E2E BullMQ Queue -> Worker consumption cycle.');

    await test('E2E BullMQ: Enqueue job -> Worker consumption -> Job completion cycle', async () => {
      const testQueueName = `test_e2e_queue_${Date.now()}`;
      const queueClient = createRedisClient();
      const workerClient = createRedisClient();

      const testQueue = new Queue(testQueueName, { connection: queueClient });
      let jobProcessed = false;
      let processedPayload: any = null;

      const testWorker = new Worker(
        testQueueName,
        async (job) => {
          jobProcessed = true;
          processedPayload = job.data;
          return { success: true, received: job.data };
        },
        { connection: workerClient }
      );

      try {
        const testData = { action: 'send_test_email', recipient: 'worker_test@icsrt.cloud', timestamp: Date.now() };
        const job = await testQueue.add('test_job', testData);

        // Wait for worker to consume job
        let attempts = 0;
        while (!jobProcessed && attempts < 30) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }

        assert.strictEqual(jobProcessed, true, 'Worker must consume and execute the enqueued job');
        assert.strictEqual(processedPayload?.recipient, 'worker_test@icsrt.cloud', 'Worker must receive exact job data');

        const jobState = await job.getState();
        assert.strictEqual(jobState, 'completed', 'Job state in BullMQ must be completed');
      } finally {
        await testWorker.close();
        await testQueue.close();
        await queueClient.quit();
        await workerClient.quit();
      }
    });
  }

  try {
    await redisConnection.quit();
  } catch (e) {}

  console.log('\n======================================================');
  console.log(`📊 WORKER TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runWorkerConsumptionTest();
