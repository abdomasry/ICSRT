// Quick test of the enhanced API endpoints
console.log("🧪 Testing Enhanced Service Orders API...");

const testAPI = async () => {
  try {
    // Test basic connectivity
    const response = await fetch('http://localhost:3000/api/admin/service-orders/enhanced');
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ API is working!");
      console.log(`Found ${data.orders?.length || 0} service orders`);
      
      if (data.orders && data.orders.length > 0) {
        const firstOrder = data.orders[0];
        console.log(`First order: ${firstOrder.orderNumber} - ${firstOrder.serviceName}`);
        console.log(`Status: ${firstOrder.status}`);
        console.log(`Messages: ${firstOrder.messages?.length || 0}`);
      }
    } else {
      console.log(`❌ API error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Connection error: ${error.message}`);
    console.log("Make sure the server is running on port 3000");
  }
};

testAPI();
