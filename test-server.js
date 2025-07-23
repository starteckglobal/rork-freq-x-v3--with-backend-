#!/usr/bin/env node

const https = require('http');

async function testServer() {
  console.log('🧪 Testing FREQ Backend Server Connection...\n');
  
  const tests = [
    {
      name: 'Health Check',
      url: 'http://localhost:8081/health',
      expected: 'Server health endpoint'
    },
    {
      name: 'API Health Check', 
      url: 'http://localhost:8081/api/health',
      expected: 'API health endpoint'
    },
    {
      name: 'tRPC Endpoint',
      url: 'http://localhost:8081/api/trpc',
      expected: 'tRPC endpoint availability'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🔍 Testing ${test.name}...`);
      
      const response = await fetch(test.url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 3000
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${test.name}: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }

  // Test tRPC login
  console.log('🔐 Testing tRPC Login...');
  try {
    const loginResponse = await fetch('http://localhost:8081/api/trpc/auth.login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'masterfreq',
        password: 'freq2007'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ tRPC Login: SUCCESS');
      console.log('   Response:', JSON.stringify(loginData, null, 2));
    } else {
      console.log('❌ tRPC Login: FAILED');
      console.log('   Status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('   Error:', errorText);
    }
  } catch (error) {
    console.log('❌ tRPC Login: ERROR');
    console.log('   Error:', error.message);
  }

  console.log('\n📋 Summary:');
  console.log('- If all tests pass, the server is working correctly');
  console.log('- If tests fail, ensure server is running: bun run server.ts');
  console.log('- Admin credentials: masterfreq / freq2007');
  console.log('- App will fall back to offline mode if server is unavailable');
}

// Run the test
testServer().catch(console.error);