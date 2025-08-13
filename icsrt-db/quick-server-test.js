// Quick server test
const testServer = async () => {
  try {
    console.log('Testing server connection...');
    
    const response = await fetch('http://localhost:3000/api/admins');
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is running! Admins collection response:', data);
      return true;
    } else {
      console.log('❌ Server responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    return false;
  }
};

// Run the test
testServer().then(isWorking => {
  if (isWorking) {
    console.log('✅ Server is working correctly');
  } else {
    console.log('❌ Please start the backend server using: node server.js');
  }
});
