const { execSync } = require('child_process');
const path = require('path');

const dashboardPath = 'd:\\Abdo\\WORK\\Real Projects\\ICSRT++\\icsrt-dashboard';

console.log('🧹 Clearing React development cache...');

try {
  // Change to dashboard directory
  process.chdir(dashboardPath);
  
  // Clear npm cache and restart
  console.log('📦 Clearing npm cache...');
  execSync('npm start -- --reset-cache', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error clearing cache:', error.message);
  console.log('\n🔧 Please manually run these commands:');
  console.log(`cd "${dashboardPath}"`);
  console.log('npm start -- --reset-cache');
}
