const mongoose = require('mongoose');
const express = require('express');

// Simple test to check if social media endpoints exist
console.log('🔍 SOCIAL MEDIA DIAGNOSTIC TOOL');
console.log('=================================');

// Check if server.js exists and has social media endpoints
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

if (fs.existsSync(serverPath)) {
    console.log('✅ server.js found');
    
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check for social media endpoints
    const socialEndpoints = [
        '/api/social-links',
        'social-links',
        'socialLinks',
        'social_links'
    ];
    
    let foundEndpoints = [];
    socialEndpoints.forEach(endpoint => {
        if (serverContent.includes(endpoint)) {
            foundEndpoints.push(endpoint);
        }
    });
    
    if (foundEndpoints.length > 0) {
        console.log('✅ Social media endpoints found:', foundEndpoints);
    } else {
        console.log('❌ No social media endpoints found in server.js');
    }
    
    // Check for MongoDB connection
    if (serverContent.includes('mongoose') || serverContent.includes('MongoClient')) {
        console.log('✅ MongoDB connection found in server');
    } else {
        console.log('❌ No MongoDB connection found');
    }
    
} else {
    console.log('❌ server.js not found at:', serverPath);
}

// Check package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    console.log('✅ package.json found');
    try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        console.log('📦 Project name:', pkg.name);
        console.log('🚀 Start script:', pkg.scripts?.start || 'not defined');
    } catch (e) {
        console.log('❌ Error reading package.json:', e.message);
    }
} else {
    console.log('❌ package.json not found');
}

console.log('\n📋 DIAGNOSIS COMPLETE');
console.log('===================');
console.log('To fix social media issues:');
console.log('1. Run: node server.js');
console.log('2. Test: http://localhost:3000/api/social-links');
console.log('3. Check dashboard at: http://localhost:3001');
