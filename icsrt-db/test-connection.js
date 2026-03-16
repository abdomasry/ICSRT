const fetch = require('node-fetch');

async function testConnection() {
  console.log("🔗 Testing Social Media API Connection...\n");
  
  try {
    console.log("1. Testing API endpoint: http://localhost:3000/api/social-links");
    
    const response = await fetch('http://localhost:3000/api/social-links', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ API is working!");
      console.log("Response:", JSON.stringify(data, null, 2));
      
      if (data.success && data.data.length === 0) {
        console.log("\n📝 No social links found, creating defaults...");
        await createDefaultLinks();
      }
    } else {
      const errorText = await response.text();
      console.log("❌ API Error:", errorText);
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log("\n💡 The database server is not running!");
      console.log("Please start it with: cd icsrt-db && node server.js");
    }
  }
}

async function createDefaultLinks() {
  const defaultLinks = [
    {
      platform: 'facebook',
      url: 'https://facebook.com/icsrt',
      label: 'Facebook',
      enabled: true
    },
    {
      platform: 'twitter', 
      url: 'https://twitter.com/icsrt',
      label: 'Twitter',
      enabled: true
    },
    {
      platform: 'linkedin',
      url: 'https://linkedin.com/company/icsrt', 
      label: 'LinkedIn',
      enabled: true
    }
  ];
  
  for (const link of defaultLinks) {
    try {
      const response = await fetch('http://localhost:3000/api/social-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(link)
      });
      
      if (response.ok) {
        console.log(`✅ Created ${link.platform} link`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create ${link.platform}: ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating ${link.platform}: ${error.message}`);
    }
  }
}

testConnection();
