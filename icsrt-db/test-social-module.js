const { socialLinksAPI } = require('./social-links-module');

console.log('🧪 Testing Social Links Module...');

// Mock request and response objects
const createMockRes = () => ({
  json: (data) => {
    console.log('📦 Response:', JSON.stringify(data, null, 2));
    return data;
  },
  status: (code) => ({
    json: (data) => {
      console.log(`❌ Error ${code}:`, JSON.stringify(data, null, 2));
      return data;
    }
  })
});

const createMockReq = (body = {}, params = {}) => ({
  body,
  params
});

async function runTests() {
  try {
    console.log('\n1️⃣ Testing GET all social links...');
    await socialLinksAPI.getAll(createMockReq(), createMockRes());
    
    console.log('\n2️⃣ Testing POST new social link...');
    await socialLinksAPI.create(
      createMockReq({
        platform: 'github',
        url: 'https://github.com/icsrt',
        label: 'GitHub',
        enabled: true
      }),
      createMockRes()
    );
    
    console.log('\n3️⃣ Testing GET all social links again...');
    await socialLinksAPI.getAll(createMockReq(), createMockRes());
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
