import assert from 'node:assert';
import { emailQueue, enqueueVerificationEmail, enqueuePasswordResetEmail, enqueueGenericEmail } from '../src/queues/email.queue';
import { whatsappQueue, enqueueWhatsAppMessage, enqueueWhatsAppCommand } from '../src/queues/whatsapp.queue';
import { isRedisAvailable, redisConnection } from '../src/config/redis';
import whatsappService from '../src/services/whatsapp.service';

async function runQueueTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 2 QUEUES & PROCESS ISOLATION TESTS');
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

  try {
    // -------------------------------------------------------------
    // Test 1: Queue Definition and Configuration
    // -------------------------------------------------------------
    await test('Queues: emailQueue and whatsappQueue are instantiated with valid BullMQ configs', async () => {
      assert.ok(emailQueue, 'emailQueue must be defined');
      assert.strictEqual(emailQueue.name, 'emailQueue');
      assert.ok(whatsappQueue, 'whatsappQueue must be defined');
      assert.strictEqual(whatsappQueue.name, 'whatsappQueue');
    });

    // -------------------------------------------------------------
    // Test 2: Enqueue Verification Email (Non-blocking)
    // -------------------------------------------------------------
    await test('Email Queue: enqueueVerificationEmail returns immediately without blocking', async () => {
      const startTime = Date.now();
      await enqueueVerificationEmail('test.verify@example.com', 'token_xyz_123', 'Test User');
      const duration = Date.now() - startTime;
      assert.ok(duration < 500, `Dispatch should be fast and non-blocking, took ${duration}ms`);
    });

    // -------------------------------------------------------------
    // Test 3: Enqueue Password Reset Email (Non-blocking)
    // -------------------------------------------------------------
    await test('Email Queue: enqueuePasswordResetEmail returns immediately without blocking', async () => {
      const startTime = Date.now();
      await enqueuePasswordResetEmail('test.reset@example.com', 'token_reset_456', 'Test User');
      const duration = Date.now() - startTime;
      assert.ok(duration < 500, `Dispatch should be fast and non-blocking, took ${duration}ms`);
    });

    // -------------------------------------------------------------
    // Test 4: Enqueue Generic Email (Non-blocking)
    // -------------------------------------------------------------
    await test('Email Queue: enqueueGenericEmail returns immediately without blocking', async () => {
      const startTime = Date.now();
      await enqueueGenericEmail({
        to: 'test.generic@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>'
      });
      const duration = Date.now() - startTime;
      assert.ok(duration < 500, `Dispatch should be fast and non-blocking, took ${duration}ms`);
    });

    // -------------------------------------------------------------
    // Test 5: WhatsApp Queue Dispatches
    // -------------------------------------------------------------
    await test('WhatsApp Queue: enqueueWhatsAppMessage handles message requests gracefully', async () => {
      const result = await enqueueWhatsAppMessage('01012345678', 'Hello from ICSRT test');
      assert.ok(typeof result === 'object', 'Result must be an object');
      assert.ok('queued' in result, 'Result must contain queued property');
    });

    // -------------------------------------------------------------
    // Test 6: WhatsApp Command Enqueue
    // -------------------------------------------------------------
    await test('WhatsApp Queue: enqueueWhatsAppCommand accepts initialize and disconnect commands', async () => {
      const initRes = await enqueueWhatsAppCommand('initialize');
      assert.ok(typeof initRes === 'object');
      const discRes = await enqueueWhatsAppCommand('disconnect');
      assert.ok(typeof discRes === 'object');
    });

    // -------------------------------------------------------------
    // Test 7: WhatsApp Service Status Delegation
    // -------------------------------------------------------------
    await test('WhatsApp Service: getStatus returns formatted status object', async () => {
      const status = await whatsappService.getStatus();
      assert.ok('isReady' in status, 'Status must contain isReady');
      assert.ok('isInitializing' in status, 'Status must contain isInitializing');
      assert.ok('hasQR' in status, 'Status must contain hasQR');
    });

  } finally {
    // Cleanly close queue connection handles
    try {
      await emailQueue.close();
      await whatsappQueue.close();
      await redisConnection.quit();
    } catch (e) {}
  }

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL QUEUE & PROCESS ISOLATION TESTS PASSED!\n');
    process.exit(0);
  }
}

runQueueTests();
