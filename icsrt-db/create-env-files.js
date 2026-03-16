#!/usr/bin/env node

/**
 * Helper script to create environment files
 * Run: node create-env-files.js
 */

const fs = require('fs');
const path = require('path');

const envFiles = {
  // Backend development environment
  'icsrt-db/.env': `# ICSRT Environment Variables

# Node Environment
NODE_ENV=development
PORT=3000

# API URLs
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3002

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004

# Database
MONGODB_URI=mongodb://localhost:27017/icsrt_db

# JWT Secret
JWT_SECRET=icsrt-dashboard-secret-key-2024

# Email Configuration (Optional)
EMAIL_USER=
EMAIL_PASS=

# Paymob Configuration (Egypt Region - Test Mode)
# Your provided credentials:
PAYMOB_API_KEY=egy_sk_test_2e9e4e5ecb9102ce8b5280e8a91ddbca8fe22d93f06e61a31bf9ffcd6ff79b19

# IMPORTANT: Get these from Paymob Dashboard
# 1. Go to: https://accept.paymob.com/
# 2. Sign in to Dashboard
# 3. Go to Payment Integrations
# 4. Get INTEGRATION_ID and IFRAME_ID
# 5. Go to Developers > Security Settings
# 6. Get HMAC_SECRET
PAYMOB_INTEGRATION_ID=your_integration_id_here
PAYMOB_IFRAME_ID=your_iframe_id_here
PAYMOB_HMAC_SECRET=your_hmac_secret_here
`,

  // Dashboard production environment
  'icsrt-dashboard/.env.production': `REACT_APP_API_BASE_URL=https://api.icsrt.cloud
`,

  // User Page production environment  
  'icsrt-userpage/.env.production': `REACT_APP_API_BASE_URL=https://api.icsrt.cloud
`
};

console.log('🔧 Creating environment files...\n');

Object.entries(envFiles).forEach(([filePath, content]) => {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Check if file already exists
  if (fs.existsSync(fullPath)) {
    console.log(`⚠️  File already exists: ${filePath}`);
    console.log(`   Skipping to avoid overwriting existing configuration.`);
  } else {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Created: ${filePath}`);
  }
});

console.log('\n📝 Next steps:');
console.log('1. Edit icsrt-db/.env and add your Paymob credentials');
console.log('2. For Paymob setup, see: PAYMOB-SETUP-GUIDE.md');
console.log('3. For deployment, see: HOSTINGER-DEPLOYMENT-GUIDE.md');
console.log('\n✨ Done!');

