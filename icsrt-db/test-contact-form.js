// Test contact form submission
const testData = {
  name: "Test User",
  email: "test@example.com",
  phone: "+1234567890",
  subject: "Test Contact Form",
  message: "This is a test message to verify the contact form is working properly.",
  category: "technical"
};

console.log('Testing contact form submission...');

fetch('http://localhost:3000/api/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('✅ Contact form submission successful!');
    console.log('Response:', data);
  } else {
    console.log('❌ Contact form submission failed:', data.error);
  }
})
.catch(error => {
  console.error('❌ Error testing contact form:', error);
});
