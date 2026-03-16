const fetch = require('node-fetch');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("🔧 ICSRT Social Media Debug & Fix Tool");
console.log("=====================================\n");

async function testPort(port) {
  try {
    const response = await fetch(`http://localhost:${port}`, { timeout: 3000 });
    return true;
  } catch (error) {
    return false;
  }
}

async function testSocialAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/social-links', { timeout: 5000 });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log("1. 🔍 Checking if servers are running...");
  
  const dbRunning = await testPort(3000);
  const dashboardRunning = await testPort(3001);
  const userpageRunning = await testPort(3002);
  
  console.log(`   Database (3000): ${dbRunning ? '✅ Running' : '❌ Not running'}`);
  console.log(`   Dashboard (3001): ${dashboardRunning ? '✅ Running' : '❌ Not running'}`);
  console.log(`   User Page (3002): ${userpageRunning ? '✅ Running' : '❌ Not running'}`);
  
  if (!dbRunning) {
    console.log("\n2. 🚀 Database server not running. Starting it...");
    
    // Check if server.js exists
    const serverPath = path.join(__dirname, 'server.js');
    if (!fs.existsSync(serverPath)) {
      console.log("❌ server.js not found in icsrt-db directory!");
      return;
    }
    
    // Start server
    console.log("   Starting database server...");
    const serverProcess = spawn('node', ['server.js'], {
      cwd: __dirname,
      stdio: 'pipe',
      detached: true
    });
    
    serverProcess.stdout.on('data', (data) => {
      console.log(`   📡 ${data.toString().trim()}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`   ❌ ${data.toString().trim()}`);
    });
    
    // Wait for server to start
    console.log("   Waiting for server to initialize...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } else {
    console.log("\n2. ✅ Database server is already running");
  }
  
  console.log("\n3. 🧪 Testing Social Media API...");
  const apiTest = await testSocialAPI();
  
  if (apiTest.success) {
    console.log("   ✅ Social Media API is working!");
    console.log(`   📊 Found ${apiTest.data.data?.length || 0} social links`);
    
    if (apiTest.data.data?.length === 0) {
      console.log("\n4. 📝 No social links found, creating defaults...");
      await createDefaultLinks();
    } else {
      console.log("\n4. 📋 Existing social links:");
      apiTest.data.data.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.label} (${link.platform}) - ${link.enabled ? 'Enabled' : 'Disabled'}`);
      });
    }
  } else {
    console.log("   ❌ Social Media API not working!");
    console.log(`   Error: ${apiTest.error}`);
    
    console.log("\n4. 🔧 Attempting to fix...");
    await createDefaultLinks();
  }
  
  console.log("\n5. 🎯 Next Steps:");
  console.log("   1. Open dashboard: http://localhost:3001");
  console.log("   2. Login with your admin credentials");
  console.log("   3. Click 'Social Media' in the sidebar");
  console.log("   4. Add/edit your social media links");
  console.log("   5. Check user page: http://localhost:3002");
  
  console.log("\n✅ Debug completed!");
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
        body: JSON.stringify(link),
        timeout: 5000
      });
      
      if (response.ok) {
        console.log(`   ✅ Created ${link.platform} link`);
      } else {
        const error = await response.text();
        console.log(`   ❌ Failed to create ${link.platform}: ${error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error creating ${link.platform}: ${error.message}`);
    }
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled error:', error.message);
});

// Run the debug tool
main().catch(console.error);
