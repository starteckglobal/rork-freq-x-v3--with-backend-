#!/usr/bin/env node

const http = require('http');

async function testConnection() {
  console.log('🔍 Testing backend connection...\n');
  
  // Test health endpoint
  console.log('1. Testing health endpoint...');
  try {
    const healthResponse = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:8081/api/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
    
    console.log('✅ Health check passed:', healthResponse.status);
    console.log('📋 Response:', JSON.stringify(healthResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
  
  // Test TRPC endpoint
  console.log('\n2. Testing TRPC endpoint...');
  try {
    const trpcResponse = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:8081/api/trpc', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
    
    console.log('✅ TRPC endpoint accessible:', trpcResponse.status);
    console.log('📋 Response:', JSON.stringify(trpcResponse.data, null, 2));
  } catch (error) {
    console.log('❌ TRPC endpoint failed:', error.message);
    return false;
  }
  
  // Test login endpoint
  console.log('\n3. Testing login endpoint...');
  try {
    const loginData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });
    
    const loginResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 8081,
        path: '/api/test-login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      
      req.write(loginData);
      req.end();
    });
    
    console.log('✅ Login test passed:', loginResponse.status);
    console.log('📋 Response:', JSON.stringify(loginResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
    return false;
  }
  
  console.log('\n🎉 All backend tests passed! The server is working correctly.');
  console.log('\n📝 Next steps:');
  console.log('1. Make sure your .env.local has the correct backend URL');
  console.log('2. Try logging in with username: admin, password: admin123');
  console.log('3. If on mobile, use your computer\'s IP address instead of localhost');
  
  return true;
}

testConnection().catch(error => {
  console.error('\n💥 Test failed with error:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure the backend is running: node start-backend-simple.js');
  console.log('2. Check if port 8081 is available');
  console.log('3. Try restarting the backend server');
});