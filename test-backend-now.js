#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

function getBaseUrlFromEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/EXPO_PUBLIC_RORK_API_BASE_URL=(.+)/);
    if (match) {
      return match[1].trim();
    }
  }
  return 'http://localhost:8081';
}

async function testEndpoint(url, name) {
  try {
    console.log(`Testing ${name}: ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.text();
      console.log(`✅ ${name}: SUCCESS`);
      try {
        const json = JSON.parse(data);
        if (json.message) console.log(`   Message: ${json.message}`);
      } catch (e) {
        // Not JSON, that's ok
      }
      return true;
    } else {
      console.log(`❌ ${name}: HTTP ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function testLogin(baseUrl) {
  try {
    console.log(`Testing Login: ${baseUrl}/test-login`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${baseUrl}/test-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Login Test: SUCCESS`);
      console.log(`   Message: ${data.message}`);
      return true;
    } else {
      console.log(`❌ Login Test: HTTP ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Login Test: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Backend Connectivity...\n');
  
  const baseUrl = getBaseUrlFromEnv();
  console.log(`Base URL: ${baseUrl}\n`);
  
  const tests = [
    () => testEndpoint(`${baseUrl}/health`, 'Health Check'),
    () => testEndpoint(`${baseUrl}/api`, 'API Root'),
    () => testEndpoint(`${baseUrl}/api/trpc`, 'TRPC Endpoint'),
    () => testLogin(baseUrl)
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    console.log(''); // Empty line between tests
  }
  
  console.log('📊 Test Results:');
  console.log(`   Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('\n🚀 You can now start the frontend with: expo start --tunnel');
    console.log('🔑 Login with: admin / admin123');
  } else {
    console.log('⚠️  Some tests failed. Backend may not be running or configured correctly.');
    console.log('\n🔧 Try running: node start-backend-complete.js');
  }
}

runTests().catch(console.error);