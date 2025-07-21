#!/usr/bin/env node

const http = require('http');

async function testBackendHealth() {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:8081';
  
  console.log(`🔍 Testing backend health at: ${baseUrl}`);
  
  const endpoints = [
    '/api',
    '/api/health',
    '/api/trpc'
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(baseUrl + endpoint);
  }
}

function testEndpoint(url) {
  return new Promise((resolve) => {
    console.log(`\n📡 Testing: ${url}`);
    
    const req = http.get(url, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`📄 Response:`, json);
        } catch (e) {
          console.log(`📄 Response: ${data.substring(0, 100)}...`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ Timeout`);
      req.destroy();
      resolve();
    });
  });
}

testBackendHealth().catch(console.error);