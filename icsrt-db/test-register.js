// Test the register endpoint
const testData = {
  fullName: "Test User",
  email: "test@example.com", 
  password: "test123",
  phone: { code: "+20", number: "1554576625", full: "+201554576625" },
  institution: "Test University",
  country: "Egypt",
  userType: "Student"
};

fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Register endpoint test result:', data);
})
.catch(error => {
  console.error('❌ Register endpoint test failed:', error);
});
