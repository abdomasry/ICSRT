console.log("Test script is running...");
console.log("Node.js version:", process.version);
console.log("Current directory:", process.cwd());

// Test if we can load required modules
try {
  const bcrypt = require('bcryptjs');
  console.log("✓ bcryptjs loaded successfully");
} catch (err) {
  console.log("✗ Error loading bcryptjs:", err.message);
}

try {
  const { MongoClient } = require('mongodb');
  console.log("✓ mongodb loaded successfully");
} catch (err) {
  console.log("✗ Error loading mongodb:", err.message);
}

console.log("Simple test completed");
