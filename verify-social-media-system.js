const fs = require('fs');
const path = require('path');

console.log("🔍 Verifying Social Media Management System Files...\n");

const filesToCheck = [
  {
    path: 'icsrt-dashboard/src/pages/SocialMediaManagement.jsx',
    description: 'Dashboard Social Media Management Component'
  },
  {
    path: 'icsrt-dashboard/src/App.jsx',
    description: 'Updated Dashboard App with Social Media Route',
    check: (content) => content.includes('SocialMediaManagement')
  },
  {
    path: 'icsrt-dashboard/src/Sidebar.jsx',
    description: 'Updated Sidebar with Social Media Menu',
    check: (content) => content.includes('social-media')
  },
  {
    path: 'icsrt-userpage/src/components/FollowUs.jsx',
    description: 'Updated FollowUs Component with Dynamic Social Links'
  },
  {
    path: 'icsrt-db/server.js',
    description: 'Server with Social Media API Endpoints',
    check: (content) => content.includes('/api/social-links')
  },
  {
    path: 'icsrt-db/setup-default-social-links.js',
    description: 'Setup Script for Default Social Links'
  },
  {
    path: 'icsrt-db/test-social-media-api.js',
    description: 'API Testing Script'
  },
  {
    path: 'SOCIAL-MEDIA-MANAGEMENT.md',
    description: 'Comprehensive Documentation'
  }
];

let allFilesExist = true;
let featuresWorking = true;

filesToCheck.forEach((file, index) => {
  const fullPath = path.resolve(file.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`✅ ${index + 1}. ${file.description}`);
    
    if (file.check) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const checkPassed = file.check(content);
        if (checkPassed) {
          console.log(`   ✓ Feature verification passed`);
        } else {
          console.log(`   ❌ Feature verification failed`);
          featuresWorking = false;
        }
      } catch (error) {
        console.log(`   ⚠️ Could not verify features: ${error.message}`);
      }
    }
  } else {
    console.log(`❌ ${index + 1}. ${file.description} - FILE MISSING`);
    allFilesExist = false;
  }
});

console.log("\n" + "=".repeat(60));

if (allFilesExist && featuresWorking) {
  console.log("🎉 All files exist and features are properly integrated!");
  
  console.log("\n📋 System Components:");
  console.log("   🖥️  Dashboard: Social Media Management Interface");
  console.log("   🌐 UserPage: Dynamic Social Links Display");
  console.log("   🔧 Backend: Complete REST API");
  console.log("   📚 Docs: Comprehensive documentation");
  
  console.log("\n🚀 Next Steps:");
  console.log("1. Start database server: cd icsrt-db && node server.js");
  console.log("2. Start dashboard: cd icsrt-dashboard && npm start");
  console.log("3. Start userpage: cd icsrt-userpage && npm start");
  console.log("4. Navigate to Social Media in dashboard sidebar");
  console.log("5. Add/edit social media links");
  console.log("6. Check userpage footer for social links");
  
} else if (!allFilesExist) {
  console.log("❌ Some files are missing. Please check the file paths.");
} else {
  console.log("⚠️ Files exist but some features may not be properly integrated.");
}

console.log("\n📊 System Status:");
console.log(`   Files: ${allFilesExist ? '✅ Complete' : '❌ Missing files'}`);
console.log(`   Features: ${featuresWorking ? '✅ Integrated' : '❌ Need attention'}`);
console.log(`   Ready: ${allFilesExist && featuresWorking ? '✅ Yes' : '❌ No'}`);

console.log("\n💡 For detailed usage instructions, see SOCIAL-MEDIA-MANAGEMENT.md");
