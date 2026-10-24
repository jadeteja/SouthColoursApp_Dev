/**
 * Automated End-to-End API Test Suite for SouthColours Live Backend
 * Run via: node tests/api.test.mjs
 */

const BASE_URL = 'https://southcolours-backend.onrender.com/api/v1';

async function runTests() {
  console.log('🚀 Starting Automated API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(title, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${title}`);
      console.error(`     Reason: ${err.message}`);
      failed++;
    }
  }

  // 1. Categories Endpoint
  await test('GET /categories returns exactly 8 main categories', async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Invalid categories response structure');
    if (json.data.length !== 8) throw new Error(`Expected 8 categories, got ${json.data.length}`);
  });

  // 2. Home Feed Endpoint
  await test('GET /home-feed returns active feed components', async () => {
    const res = await fetch(`${BASE_URL}/home-feed`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error('Invalid home-feed response');
  });

  // 3. Products List Endpoint
  await test('GET /products retrieves active catalog products', async () => {
    const res = await fetch(`${BASE_URL}/products?page=0&size=10`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.content) throw new Error('Invalid products page structure');
    if (json.data.content.length === 0) throw new Error('Catalog has 0 products');
  });

  // 4. Admin Auth Login & Dashboard Token
  let adminToken = null;
  await test('POST /admin/auth/login authenticates admin credentials', async () => {
    const res = await fetch(`${BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@southcolours.com', password: 'password123' })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.accessToken) throw new Error('Missing accessToken');
    adminToken = json.data.accessToken;
  });

  // 5. Admin Dashboard Metrics
  await test('GET /admin/dashboard returns valid metrics with admin token', async () => {
    if (!adminToken) throw new Error('Admin token missing from previous step');
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || typeof json.data.totalProducts !== 'number') {
      throw new Error('Invalid dashboard metrics format');
    }
  });

  // 6. Admin Orders Endpoint
  await test('GET /admin/orders returns order list array', async () => {
    if (!adminToken) throw new Error('Admin token missing');
    const res = await fetch(`${BASE_URL}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Invalid orders response');
  });

  // 7. Security: Reject unauthorized admin access
  await test('GET /admin/dashboard returns 403 Forbidden without token', async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`);
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 8. Razorpay Web Checkout Interface
  await test('GET /payment-gateway/pay renders dynamic Razorpay HTML checkout portal', async () => {
    const res = await fetch(`${BASE_URL}/payment-gateway/pay?amount=1499&orderNumber=SC_TEST123&name=CustomerTest`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    if (!html.includes('checkout.razorpay.com') || !html.includes('Southcolours')) {
      throw new Error('Razorpay checkout HTML missing SDK or branding elements');
    }
  });

  // 9. Admin Coupons Endpoint
  await test('GET /admin/coupons returns promotional vouchers array', async () => {
    if (!adminToken) throw new Error('Admin token missing');
    const res = await fetch(`${BASE_URL}/admin/coupons`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Invalid coupons response format');
  });

  // 10. Admin Banners Endpoint
  await test('GET /admin/banners returns promotional banners array', async () => {
    if (!adminToken) throw new Error('Admin token missing');
    const res = await fetch(`${BASE_URL}/admin/banners`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Invalid banners response format');
  });

  console.log(`\n================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
