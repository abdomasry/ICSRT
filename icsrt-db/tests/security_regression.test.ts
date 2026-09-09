import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import app from '../src/app';
import { JWT_SECRET } from '../src/config/env';
import { ServiceModel } from '../src/models/Service.model';
import { TicketModel } from '../src/models/Ticket.model';
import { UserModel } from '../src/models/User.model';
import paymobService from '../src/services/paymob.service';

// Mock server helper for HTTP requests using Node built-in fetch
let server: any;
let baseUrl: string;

const adminToken = jwt.sign(
  { userId: 'admin123', email: 'admin@icsrt.cloud', name: 'Admin User', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const userAToken = jwt.sign(
  { userId: 'userA123', email: 'usera@example.com', name: 'User A', role: 'user' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const userBToken = jwt.sign(
  { userId: 'userB456', email: 'userb@example.com', name: 'User B', role: 'user' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function startTestServer() {
  return new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`🧪 Test server started at ${baseUrl}`);
      resolve();
    });
  });
}

async function stopTestServer() {
  return new Promise<void>((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 1 SECURITY REGRESSION TEST SUITE');
  console.log('======================================================\n');

  await startTestServer();
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
    // Test 1: requireAdmin - Missing Token Rejection
    // -------------------------------------------------------------
    await test('requireAdmin: Rejects unauthenticated request with 401', async () => {
      const res = await fetch(`${baseUrl}/api/service-orders`);
      assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
      const body = await res.json();
      assert.strictEqual(body.code, 'ADMIN_AUTH_REQUIRED');
    });

    // -------------------------------------------------------------
    // Test 2: requireAdmin - Spoofed Origin Header Rejection (Origin Bypass Patch)
    // -------------------------------------------------------------
    await test('requireAdmin: Rejects request with spoofed Origin header (Origin bypass is fixed)', async () => {
      const res = await fetch(`${baseUrl}/api/service-orders`, {
        headers: {
          'Origin': 'https://icsrt.cloud'
        }
      });
      assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
      const body = await res.json();
      assert.strictEqual(body.code, 'ADMIN_AUTH_REQUIRED');
    });

    // -------------------------------------------------------------
    // Test 3: requireAdmin - Standard User Token Rejection (403 Forbidden)
    // -------------------------------------------------------------
    await test('requireAdmin: Rejects regular user token with 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/api/service-orders`, {
        headers: {
          'Authorization': `Bearer ${userAToken}`
        }
      });
      assert.strictEqual(res.status, 403, `Expected 403, got ${res.status}`);
    });

    // -------------------------------------------------------------
    // Test 4: requireUser - Rejects Unauthenticated on Protected User Endpoints
    // -------------------------------------------------------------
    await test('requireUser: Rejects unauthenticated request on /api/user/service-orders with 401', async () => {
      const res = await fetch(`${baseUrl}/api/user/service-orders`);
      assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
    });

    // -------------------------------------------------------------
    // Test 5: IDOR User Profile - User A cannot view User B profile
    // -------------------------------------------------------------
    await test('IDOR: User A cannot access User B profile (/api/users/:id) -> 403', async () => {
      const res = await fetch(`${baseUrl}/api/users/userB456`, {
        headers: {
          'Authorization': `Bearer ${userAToken}`
        }
      });
      assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
    });

    // -------------------------------------------------------------
    // Test 6: IDOR User Profile - User A can access own profile
    // -------------------------------------------------------------
    await test('IDOR: User A can access own profile (/api/users/userA123) -> Allowed', async () => {
      // Mock findById for test
      const originalFindById = UserModel.findById;
      UserModel.findById = async (id: any) => ({ _id: id, name: 'User A', email: 'usera@example.com', role: 'user' } as any);

      try {
        const res = await fetch(`${baseUrl}/api/users/userA123`, {
          headers: {
            'Authorization': `Bearer ${userAToken}`
          }
        });
        assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      } finally {
        UserModel.findById = originalFindById;
      }
    });

    // -------------------------------------------------------------
    // Test 7: IDOR Service Orders - User A cannot access User B order
    // -------------------------------------------------------------
    await test('IDOR: User A cannot access User B order (/api/user/service-orders/:id) -> 403', async () => {
      const originalFindOrderById = ServiceModel.findOrderById;
      ServiceModel.findOrderById = async () => ({
        _id: 'orderB123',
        orderNumber: 'ORD-999',
        userEmail: 'userb@example.com',
        userId: 'userB456',
        status: 'pending'
      } as any);

      try {
        const res = await fetch(`${baseUrl}/api/user/service-orders/orderB123`, {
          headers: {
            'Authorization': `Bearer ${userAToken}`
          }
        });
        assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
      } finally {
        ServiceModel.findOrderById = originalFindOrderById;
      }
    });

    // -------------------------------------------------------------
    // Test 8: Data Leak Closure - Tickets endpoint requires auth
    // -------------------------------------------------------------
    await test('Data Leak: /api/tickets rejects unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/tickets`);
      assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
    });

    // -------------------------------------------------------------
    // Test 9: IDOR Tickets - User A querying tickets only gets User A tickets
    // -------------------------------------------------------------
    await test('IDOR: User A querying /api/tickets scopes strictly to User A email', async () => {
      let capturedQuery: any = null;
      const originalFind = TicketModel.find;
      TicketModel.find = async (query: any) => {
        capturedQuery = query;
        return [];
      };

      try {
        const res = await fetch(`${baseUrl}/api/tickets?userEmail=victim@example.com`, {
          headers: {
            'Authorization': `Bearer ${userAToken}`
          }
        });
        assert.strictEqual(res.status, 200);
        // The controller MUST ignore ?userEmail=victim and force req.user.email
        assert.strictEqual(capturedQuery?.userEmail, 'usera@example.com', 'Query must be scoped to authenticated user email');
      } finally {
        TicketModel.find = originalFind;
      }
    });

    // -------------------------------------------------------------
    // Test 10: Data Leak - Sensitive CMS Collection /api/admins requires admin auth
    // -------------------------------------------------------------
    await test('Data Leak: /api/admins rejects unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/admins`);
      assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
    });

    // -------------------------------------------------------------
    // Test 11: Data Leak - /api/user/payments requires auth
    // -------------------------------------------------------------
    await test('Data Leak: /api/user/payments rejects unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/user/payments`);
      assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
    });

    // -------------------------------------------------------------
    // Test 12: Paymob Webhook - Missing HMAC signature fails closed (400)
    // -------------------------------------------------------------
    await test('Paymob: Webhook without HMAC signature is rejected with 400', async () => {
      const res = await fetch(`${baseUrl}/api/paymob/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ obj: { id: 123456, success: true } })
      });
      assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
    });

    // -------------------------------------------------------------
    // Test 13: Paymob Webhook - Invalid HMAC signature is rejected (400)
    // -------------------------------------------------------------
    await test('Paymob: Webhook with invalid HMAC signature is rejected with 400', async () => {
      const res = await fetch(`${baseUrl}/api/paymob/callback?hmac=fake_invalid_hmac_signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          obj: {
            id: 123456,
            success: true,
            order: { merchant_order_id: 'ORD-123' }
          }
        })
      });
      assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
    });

    // -------------------------------------------------------------
    // Test 14: Paymob Webhook - Valid HMAC signature updates order status to paid
    // -------------------------------------------------------------
    await test('Paymob: Webhook with valid HMAC processes successfully', async () => {
      const hmacSecret = 'test_hmac_secret_2026';
      (paymobService as any).config.HMAC_SECRET = hmacSecret;

      const mockObj: any = {
        amount_cents: 5000,
        created_at: '2026-08-16T00:00:00.000Z',
        currency: 'EGP',
        error_occured: false,
        has_parent_transaction: false,
        id: 7891011,
        integration_id: 5232435,
        is_3d_secure: true,
        is_auth: false,
        is_capture: false,
        is_refunded: false,
        is_standalone_payment: false,
        order: { id: 9999, merchant_order_id: 'ORD-SUCCESS-1' },
        owner: 100,
        pending: false,
        source_data: { pan: '2345', sub_type: 'MasterCard', type: 'card' },
        success: true
      };

      const concatenated = [
        mockObj.amount_cents,
        mockObj.created_at,
        mockObj.currency,
        mockObj.error_occured,
        mockObj.has_parent_transaction,
        mockObj.id,
        mockObj.integration_id,
        mockObj.is_3d_secure,
        mockObj.is_auth,
        mockObj.is_capture,
        mockObj.is_refunded,
        mockObj.is_standalone_payment,
        mockObj.order.id,
        mockObj.owner,
        mockObj.pending,
        mockObj.source_data.pan,
        mockObj.source_data.sub_type,
        mockObj.source_data.type,
        mockObj.success
      ].map(v => String(v)).join('');

      const validHmac = crypto.createHmac('sha512', hmacSecret).update(concatenated).digest('hex');

      let updatedStatus: any = null;
      let updatedTxId: any = null;

      const originalFindOrderById = ServiceModel.findOrderById;
      const originalUpdateOrderById = ServiceModel.updateOrderById;

      ServiceModel.findOrderById = async () => ({
        _id: 'ord_success_1',
        orderNumber: 'ORD-SUCCESS-1',
        price: 50,
        currency: 'EGP',
        status: 'pending'
      } as any);

      ServiceModel.updateOrderById = async (id: any, update: any) => {
        updatedStatus = update.status;
        updatedTxId = update.paymobTransactionId;
        return { _id: id, ...update } as any;
      };

      try {
        const res = await fetch(`${baseUrl}/api/paymob/callback?hmac=${validHmac}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ obj: mockObj })
        });
        assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
        assert.strictEqual(updatedStatus, 'paid', 'Order status should be updated to paid');
        assert.strictEqual(updatedTxId, 7891011, 'Paymob transaction ID should be saved');
      } finally {
        ServiceModel.findOrderById = originalFindOrderById;
        ServiceModel.updateOrderById = originalUpdateOrderById;
      }
    });

    // -------------------------------------------------------------
    // Test 15: Paymob Webhook - Idempotent Callback Handling
    // -------------------------------------------------------------
    await test('Paymob: Duplicate webhook callback is idempotent and returns 200', async () => {
      const hmacSecret = 'test_hmac_secret_2026';
      (paymobService as any).config.HMAC_SECRET = hmacSecret;

      const mockObj: any = {
        amount_cents: 5000,
        created_at: '2026-08-16T00:00:00.000Z',
        currency: 'EGP',
        error_occured: false,
        has_parent_transaction: false,
        id: 7891011,
        integration_id: 5232435,
        is_3d_secure: true,
        is_auth: false,
        is_capture: false,
        is_refunded: false,
        is_standalone_payment: false,
        order: { id: 9999, merchant_order_id: 'ORD-ALREADY-PAID' },
        owner: 100,
        pending: false,
        source_data: { pan: '2345', sub_type: 'MasterCard', type: 'card' },
        success: true
      };

      const concatenated = [
        mockObj.amount_cents,
        mockObj.created_at,
        mockObj.currency,
        mockObj.error_occured,
        mockObj.has_parent_transaction,
        mockObj.id,
        mockObj.integration_id,
        mockObj.is_3d_secure,
        mockObj.is_auth,
        mockObj.is_capture,
        mockObj.is_refunded,
        mockObj.is_standalone_payment,
        mockObj.order.id,
        mockObj.owner,
        mockObj.pending,
        mockObj.source_data.pan,
        mockObj.source_data.sub_type,
        mockObj.source_data.type,
        mockObj.success
      ].map(v => String(v)).join('');

      const validHmac = crypto.createHmac('sha512', hmacSecret).update(concatenated).digest('hex');

      const originalFindOrderById = ServiceModel.findOrderById;
      ServiceModel.findOrderById = async () => ({
        _id: 'ord_already_paid',
        orderNumber: 'ORD-ALREADY-PAID',
        price: 50,
        currency: 'EGP',
        status: 'paid',
        paymobTransactionId: 7891011
      } as any);

      try {
        const res = await fetch(`${baseUrl}/api/paymob/callback?hmac=${validHmac}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ obj: mockObj })
        });
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.data?.duplicate, true, 'Response must indicate duplicate idempotent handling');
      } finally {
        ServiceModel.findOrderById = originalFindOrderById;
      }
    });

  } finally {
    await stopTestServer();
  }

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL SECURITY REGRESSION TESTS PASSED CLEANLY!\n');
    process.exit(0);
  }
}

runTests();
