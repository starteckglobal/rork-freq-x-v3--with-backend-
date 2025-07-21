#!/usr/bin/env node

const os = require('os');

function getLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  
  for (const name of Object.keys(networkInterfaces)) {
    const networkInterface = networkInterfaces[name];
    if (networkInterface) {
      for (const netInterface of networkInterface) {
        if (netInterface.family === 'IPv4' && !netInterface.internal) {
          return netInterface.address;
        }
      }
    }
  }
  
  return 'localhost';
}

async function testEndpoint(url, name) {
  try {
    console.log(`🔍 Testing ${name}: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${name}: OK`);
      if (data.message) console.log(`   Message: ${data.message}`);
      return true;
    } else {
      console.log(`❌ ${name}: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function testLogin(baseUrl) {
  try {
    console.log(`🔐 Testing login: ${baseUrl}/test-login`);
    
    const response = await fetch(`${baseUrl}/test-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Login test: ${data.message}`);
      return true;
    } else {
      console.log(`❌ Login test: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Login test: ${error.message}`);
    return false;
  }
}

async function testTRPC(baseUrl) {
  try {
    console.log(`🔧 Testing tRPC: ${baseUrl}/api/trpc`);
    
    const response = await fetch(`${baseUrl}/api/trpc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log(`✅ tRPC endpoint: OK`);
      return true;
    } else {
      console.log(`❌ tRPC endpoint: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ tRPC endpoint: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 FREQ Backend Connection Test\n');
  
  const localIP = getLocalIPAddress();
  const baseUrl = `http://${localIP}:8081`;
  
  console.log(`📍 Testing backend at: ${baseUrl}\n`);
  
  const tests = [
    () => testEndpoint(`${baseUrl}/health`, 'Health Check'),
    () => testEndpoint(`${baseUrl}/api/health`, 'API Health Check'),
    () => testTRPC(baseUrl),
    () => testLogin(baseUrl)
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    if (await test()) {
      passed++;
    }
    console.log(''); // Add spacing
  }
  
  console.log(`📊 Test Results: ${passed}/${total} passed\n`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log(`\n🔑 Admin Login Credentials:`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`\n📱 Ready to use! Start frontend with: expo start --tunnel`);
  } else {
    console.log('⚠️  Some tests failed. Backend may not be running or configured correctly.');
    console.log(`\n🔧 Troubleshooting:`);
    console.log(`   1. Start backend: node start-backend-fixed.js`);
    console.log(`   2. Check if port 8081 is available`);
    console.log(`   3. Verify .env.local configuration`);
    console.log(`   4. Check firewall settings`);
  }
}

runTests().catch(console.error);