const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testSocialMediaAPI() {
  console.log("🧪 Testing Social Media API Endpoints...\n");
  
  try {
    // Test 1: Get all social links
    console.log("📋 Test 1: GET /api/social-links");
    const getResponse = await fetch(`${API_BASE_URL}/api/social-links`);
    const getData = await getResponse.json();
    
    if (getData.success) {
      console.log(`✅ Success: Found ${getData.data.length} social links`);
      getData.data.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.label} (${link.platform}) - ${link.enabled ? 'Enabled' : 'Disabled'}`);
      });
    } else {
      console.log(`❌ Failed: ${getData.error}`);
    }
    
    console.log();
    
    // Test 2: Create a new social link
    console.log("➕ Test 2: POST /api/social-links (Create new link)");
    const newLink = {
      platform: 'github',
      url: 'https://github.com/icsrt',
      label: 'GitHub',
      enabled: true
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/api/social-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLink)
    });
    
    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log(`✅ Success: Created ${createData.data.label} link`);
      console.log(`   ID: ${createData.data._id}`);
      console.log(`   URL: ${createData.data.url}`);
      
      // Test 3: Update the created link
      console.log("\n✏️ Test 3: PUT /api/social-links/:id (Update link)");
      const updateResponse = await fetch(`${API_BASE_URL}/api/social-links/${createData.data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: false,
          label: 'GitHub (Updated)'
        })
      });
      
      const updateData = await updateResponse.json();
      
      if (updateData.success) {
        console.log("✅ Success: Updated social link");
      } else {
        console.log(`❌ Failed to update: ${updateData.error}`);
      }
      
      // Test 4: Get single link
      console.log("\n🔍 Test 4: GET /api/social-links/:id (Get single link)");
      const getSingleResponse = await fetch(`${API_BASE_URL}/api/social-links/${createData.data._id}`);
      const getSingleData = await getSingleResponse.json();
      
      if (getSingleData.success) {
        console.log("✅ Success: Retrieved single link");
        console.log(`   Label: ${getSingleData.data.label}`);
        console.log(`   Enabled: ${getSingleData.data.enabled}`);
      } else {
        console.log(`❌ Failed to get single link: ${getSingleData.error}`);
      }
      
      // Test 5: Delete the created link
      console.log("\n🗑️ Test 5: DELETE /api/social-links/:id (Delete link)");
      const deleteResponse = await fetch(`${API_BASE_URL}/api/social-links/${createData.data._id}`, {
        method: 'DELETE'
      });
      
      const deleteData = await deleteResponse.json();
      
      if (deleteData.success) {
        console.log("✅ Success: Deleted social link");
      } else {
        console.log(`❌ Failed to delete: ${deleteData.error}`);
      }
      
    } else {
      console.log(`❌ Failed to create: ${createData.error}`);
    }
    
    console.log("\n🎉 API Testing completed!");
    
  } catch (error) {
    console.error("💥 Test failed:", error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log("\n💡 Make sure the database server is running:");
      console.log("   cd icsrt-db && node server.js");
    }
  }
}

// Test validation functions
async function testValidation() {
  console.log("\n🔒 Testing API Validation...\n");
  
  try {
    // Test invalid URL
    console.log("🚫 Test: Invalid URL validation");
    const invalidUrlResponse = await fetch(`${API_BASE_URL}/api/social-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: 'invalid',
        url: 'not-a-valid-url',
        label: 'Invalid'
      })
    });
    
    const invalidUrlData = await invalidUrlResponse.json();
    
    if (!invalidUrlData.success && invalidUrlData.code === 'INVALID_URL') {
      console.log("✅ URL validation working correctly");
    } else {
      console.log("❌ URL validation failed");
    }
    
    // Test missing required fields
    console.log("\n🚫 Test: Missing required fields validation");
    const missingFieldsResponse = await fetch(`${API_BASE_URL}/api/social-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        label: 'Missing platform and URL'
      })
    });
    
    const missingFieldsData = await missingFieldsResponse.json();
    
    if (!missingFieldsData.success && missingFieldsData.code === 'MISSING_REQUIRED_FIELDS') {
      console.log("✅ Required fields validation working correctly");
    } else {
      console.log("❌ Required fields validation failed");
    }
    
  } catch (error) {
    console.error("💥 Validation test failed:", error.message);
  }
}

// Run tests
if (require.main === module) {
  Promise.resolve()
    .then(() => testSocialMediaAPI())
    .then(() => testValidation())
    .then(() => {
      console.log("\n🏆 All tests completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    });
}
