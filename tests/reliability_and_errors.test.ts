import assert from 'node:assert';
import http from 'http';
import app from '../src/app';
import { redisConnection } from '../src/config/redis';
import { closeDB } from '../src/config/db';

async function runReliabilityAndErrorTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 6 RELIABILITY & ERROR HANDLING TEST SUITE');
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

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // -------------------------------------------------------------
    // Test 1: 404 Not Found Standard Envelope
    // -------------------------------------------------------------
    await test('Error Handling: 404 handler returns standardized error envelope', async () => {
      const response = await fetch(`${baseUrl}/api/non_existent_route_404`);
      assert.strictEqual(response.status, 404);
      const body = await response.json();

      assert.strictEqual(body.success, false);
      assert.strictEqual(body.statusCode, 404);
      assert.strictEqual(body.code, 'NOT_FOUND');
      assert.ok(typeof body.error === 'string');
      assert.ok(body.timestamp, 'Response must include timestamp');
    });

    // -------------------------------------------------------------
    // Test 2: 401 Unauthorized Standard Envelope
    // -------------------------------------------------------------
    await test('Error Handling: 401 unauthenticated request returns standardized code and message', async () => {
      const response = await fetch(`${baseUrl}/api/user/service-orders`);
      assert.strictEqual(response.status, 401);
      const body = await response.json();

      assert.strictEqual(body.success, false);
      assert.strictEqual(body.statusCode, 401);
      assert.strictEqual(body.code, 'AUTH_REQUIRED');
      assert.ok(typeof body.error === 'string');
    });

    // -------------------------------------------------------------
    // Test 3: 400 Bad Request Validation
    // -------------------------------------------------------------
    await test('Error Handling: 400 validation error returns details and clean code', async () => {
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing required fields
      });

      assert.strictEqual(response.status, 400);
      const body = await response.json();

      assert.strictEqual(body.success, false);
      assert.strictEqual(body.statusCode, 400);
      assert.ok(body.code === 'BAD_REQUEST' || body.code === 'VALIDATION_ERROR');
      assert.ok(typeof body.error === 'string');
    });

    // -------------------------------------------------------------
    // Test 4: Request-ID Header Propagation
    // -------------------------------------------------------------
    await test('Observability: Request-ID is generated and returned on all responses', async () => {
      const customId = `req-trace-${Date.now()}`;
      const response = await fetch(`${baseUrl}/health`, {
        headers: { 'x-request-id': customId }
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('x-request-id'), customId);
    });

    // -------------------------------------------------------------
    // Test 5: Liveness Probe
    // -------------------------------------------------------------
    await test('Health Probes: GET /health provides liveness and memory diagnostics', async () => {
      const response = await fetch(`${baseUrl}/health`);
      assert.strictEqual(response.status, 200);
      const body = await response.json();

      assert.strictEqual(body.status, 'OK');
      assert.strictEqual(body.type, 'liveness');
      assert.ok(typeof body.uptimeSeconds === 'number');
      assert.ok(typeof body.memory?.heapUsedMb === 'number');
    });

    // -------------------------------------------------------------
    // Test 6: Readiness Probe
    // -------------------------------------------------------------
    await test('Health Probes: GET /health/readiness verifies database connectivity', async () => {
      const response = await fetch(`${baseUrl}/health/readiness`);
      assert.ok(response.status === 200 || response.status === 503);
      const body = await response.json();

      assert.strictEqual(body.type, 'readiness');
      assert.ok('dependencies' in body);
      assert.ok('database' in body.dependencies);
      assert.ok('redis' in body.dependencies);
    });

    // -------------------------------------------------------------
    // Test 7: Production Error Safety (No Stack Leak)
    // -------------------------------------------------------------
    await test('Error Safety: Error response never exposes stack trace or internal secrets to client', async () => {
      const response = await fetch(`${baseUrl}/api/non_existent_route_404`);
      const body = await response.json();

      assert.strictEqual(body.stack, undefined, 'Response must never include stack trace property');
      assert.strictEqual(body.stackTrace, undefined);
    });

  } finally {
    server.close();
    try {
      await redisConnection.quit();
      await closeDB();
    } catch (e) {}
  }

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL RELIABILITY & ERROR HANDLING TESTS PASSED!\n');
    process.exit(0);
  }
}

runReliabilityAndErrorTests();
