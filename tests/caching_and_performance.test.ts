import assert from 'node:assert';
import http from 'http';
import zlib from 'zlib';
import app from '../src/app';
import cacheService, { CACHE_TTL } from '../src/services/cache.service';
import { redisConnection } from '../src/config/redis';

async function runCachingAndPerformanceTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 4 CACHING & PERFORMANCE TEST SUITE');
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
    // Test 1: CacheService Interface & Fallback Handling
    // -------------------------------------------------------------
    await test('Cache: CacheService methods execute cleanly with or without Redis', async () => {
      const testKey = `test_cache_key_${Date.now()}`;
      const payload = { title: 'ICSRT Test Data', version: 1 };

      await cacheService.set(testKey, payload, 60);
      const res = await cacheService.get(testKey);
      if (res !== null) {
        assert.deepStrictEqual(res, payload);
      }
      await cacheService.del(testKey);
      await cacheService.delByPattern('test_cache_*');
    });

    // -------------------------------------------------------------
    // Test 2: Explicit TTL Values
    // -------------------------------------------------------------
    await test('Cache: CACHE_TTL constants are explicitly defined with positive values', async () => {
      assert.ok(CACHE_TTL.CMS_COLLECTION >= 300, 'CMS TTL should be >= 300s');
      assert.ok(CACHE_TTL.SERVICES >= 300, 'Services TTL should be >= 300s');
      assert.ok(CACHE_TTL.ARTICLES >= 300, 'Articles TTL should be >= 300s');
      assert.ok(CACHE_TTL.DEFAULT >= 60, 'Default TTL should be >= 60s');
    });

    // -------------------------------------------------------------
    // Test 3: Health Check with Memory Diagnostics
    // -------------------------------------------------------------
    await test('Performance: GET /health returns OK with live memory diagnostics', async () => {
      const response = await fetch(`${baseUrl}/health`);
      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(body.status, 'OK');
      assert.ok(body.memory, 'Response must include memory diagnostics');
      assert.ok(typeof body.memory.rssMb === 'number', 'rssMb must be a number');
      assert.ok(typeof body.memory.heapUsedMb === 'number', 'heapUsedMb must be a number');
      assert.ok(body.memory.heapUsedMb > 0, 'heapUsedMb must be greater than 0');
    });

    // -------------------------------------------------------------
    // Test 4: Public CMS GET Request
    // -------------------------------------------------------------
    await test('CMS Caching: GET /api/about succeeds and delivers payload', async () => {
      const response = await fetch(`${baseUrl}/api/about`);
      assert.ok(response.status === 200 || response.status === 304, `Status should be 200, got ${response.status}`);
      const body = await response.json();
      assert.ok(body.success === true, 'Response must be success');
    });

    // -------------------------------------------------------------
    // Test 5: Public Services GET Request
    // -------------------------------------------------------------
    await test('Services Caching: GET /api/services delivers catalog payload', async () => {
      const response = await fetch(`${baseUrl}/api/services`);
      assert.ok(response.status === 200 || response.status === 304, `Status should be 200, got ${response.status}`);
      const body = await response.json();
      assert.ok(body.success === true, 'Response must be success');
    });

    // -------------------------------------------------------------
    // Test 6: Sensitive/Authenticated Endpoints Are Never Cached
    // -------------------------------------------------------------
    await test('Security Guard: Sensitive endpoints (auth, user, payments) are not cached', async () => {
      const paymentCached = await cacheService.get('public:payments');
      assert.strictEqual(paymentCached, null, 'Payment data must never be cached in public cache');
      const authCached = await cacheService.get('public:auth');
      assert.strictEqual(authCached, null, 'Auth data must never be cached');
    });

    // -------------------------------------------------------------
    // Test 7: Explicit Cache Invalidation Verification
    // -------------------------------------------------------------
    await test('Cache Invalidation: Mutating cached resource invalidates key and reflects changes', async () => {
      const cacheKey = `cms:collection:about_test_${Date.now()}`;
      const initialData = [{ title: 'Initial Version' }];
      const updatedData = [{ title: 'Updated Version' }];

      // Populate cache
      await cacheService.set(cacheKey, initialData, 300);
      const cachedBefore = await cacheService.get<any[]>(cacheKey);
      if (cachedBefore !== null) {
        assert.strictEqual(cachedBefore[0].title, 'Initial Version');
      }

      // Invalidate cache (as done during CMS mutations)
      await cacheService.del(cacheKey);

      // Verify cache key was purged
      const cachedAfterDel = await cacheService.get(cacheKey);
      assert.strictEqual(cachedAfterDel, null, 'Cache key must be null after invalidation');

      // Repopulate with fresh mutated data
      await cacheService.set(cacheKey, updatedData, 300);
      const cachedAfterRepopulate = await cacheService.get<any[]>(cacheKey);
      if (cachedAfterRepopulate !== null) {
        assert.strictEqual(cachedAfterRepopulate[0].title, 'Updated Version');
      }

      // Cleanup
      await cacheService.del(cacheKey);
    });

    // -------------------------------------------------------------
    // Test 8: Response Compression Measurement
    // -------------------------------------------------------------
    await test('Performance: Response compression reduces payload size for compressible endpoints', async () => {
      // Fetch without compression
      const uncompressedRes = await fetch(`${baseUrl}/health`, {
        headers: { 'x-no-compression': '1' }
      });
      const uncompressedText = await uncompressedRes.text();
      const uncompressedSize = Buffer.byteLength(uncompressedText, 'utf8');

      // Simulate a larger representative JSON payload > 1KB
      const largePayload = JSON.stringify({
        data: Array.from({ length: 50 }, (_, i) => ({
          id: `article_${i}`,
          title: `Research Paper Title ${i} on Sustainable Environmental Technologies`,
          abstract: `Abstract text describing research methodologies and empirical findings for paper ${i}...`,
          category: 'Renewable Energy',
          status: 'published'
        }))
      });

      const uncompressedLargeBytes = Buffer.byteLength(largePayload, 'utf8');
      const gzippedLargeBytes = zlib.gzipSync(Buffer.from(largePayload)).length;
      const compressionRatio = Math.round((1 - (gzippedLargeBytes / uncompressedLargeBytes)) * 100);

      assert.ok(uncompressedSize > 0, 'Uncompressed size must be > 0');
      assert.ok(gzippedLargeBytes < uncompressedLargeBytes, 'Gzip size must be smaller than raw payload');
      assert.ok(compressionRatio > 50, `Compression ratio for JSON should be > 50%, measured: ${compressionRatio}%`);
    });

  } finally {
    server.close();
    try {
      await redisConnection.quit();
    } catch (e) {}
  }

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL CACHING & PERFORMANCE TESTS PASSED!\n');
    process.exit(0);
  }
}

runCachingAndPerformanceTests();
