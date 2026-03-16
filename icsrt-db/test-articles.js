// Quick test for research articles module
const { articlesAPI } = require('./research-articles-module');

console.log('📝 Testing research articles module...');

// Mock req and res objects
const mockReq = {
  query: {
    limit: '3',
    featured: 'true',
    language: 'en'
  }
};

const mockRes = {
  json: (data) => {
    console.log('✅ Featured articles API response:', data);
    console.log(`Found ${data.count} featured articles`);
    if (data.data && data.data.length > 0) {
      console.log('First article:', {
        title: data.data[0].title,
        author: data.data[0].author,
        category: data.data[0].category
      });
    }
  },
  status: (code) => ({
    json: (data) => {
      console.log('❌ Error response:', code, data);
    }
  })
};

// Test the getFeatured function
console.log('Testing getFeatured...');
articlesAPI.getFeatured(mockReq, mockRes);

console.log('\n🔍 Testing module initialization...');
console.log('Articles module loaded successfully!');
