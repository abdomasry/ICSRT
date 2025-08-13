// Simple connectivity test for React frontend
export const testSocialLinksAPI = async () => {
  const API_BASE_URL = 'http://localhost:3000';
  
  console.log('🧪 Testing Social Links API connectivity from React...');
  
  try {
    // Test basic server connectivity
    console.log('1️⃣ Testing server connectivity...');
    const testResponse = await fetch(`${API_BASE_URL}/test`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Server is reachable:', testData);
    } else {
      console.error('❌ Server not reachable, status:', testResponse.status);
      return false;
    }
    
    // Test social links API
    console.log('2️⃣ Testing social links API...');
    const response = await fetch(`${API_BASE_URL}/api/social-links`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error response:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('📦 API data received:', data);
    
    if (data.success && Array.isArray(data.data)) {
      console.log('✅ Social Links API is working! Found', data.data.length, 'social links');
      return true;
    } else {
      console.error('❌ Invalid API response format:', data);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Connectivity test failed:', error.message);
    if (error.message.includes('Failed to fetch')) {
      console.error('🔗 Cannot connect to server. Make sure the backend server is running on http://localhost:3000');
    }
    return false;
  }
};

// Call the test function when this module is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testSocialLinksAPI().then(result => {
      if (result) {
        console.log('🎉 Social Links API connectivity test PASSED!');
      } else {
        console.log('💥 Social Links API connectivity test FAILED!');
      }
    });
  }, 1000);
}

export default testSocialLinksAPI;
