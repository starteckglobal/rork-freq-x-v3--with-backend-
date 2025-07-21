#!/usr/bin/env node

const http = require('http');

async function testBackend() {
  console.log('🔍 Testing backend connection...\n');
  
  const testUrls = [
    'http://localhost:8081/health',
    'http://localhost:8081/api/health',
    'http://localhost:8081/api/trpc'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      
      const response = await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      
      console.log(`✅ Status: ${response.status}`);
      if (response.data) {
        try {
          const parsed = JSON.parse(response.data);
          console.log(`   Response: ${JSON.stringify(parsed, null, 2)}`);
        } catch {
          console.log(`   Response: ${response.data.substring(0, 100)}...`);
        }
      }
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('🔑 Try logging in with:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('\n   OR\n');
  console.log('   Username: masterfreq');
  console.log('   Password: freq2007');
}

testBackend().catch(console.error);