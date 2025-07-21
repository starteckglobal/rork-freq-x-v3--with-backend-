#!/usr/bin/env node

const fetch = require('node-fetch');

async function testBackend() {
  const baseUrl = 'http://localhost:8081';
  
  console.log('Testing backend connectivity...');
  
  try {
    // Test basic health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/api`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test TRPC endpoint
    console.log('2. Testing TRPC endpoint...');
    const trpcResponse = await fetch(`${baseUrl}/api/trpc`);
    const trpcData = await trpcResponse.json();
    console.log('TRPC check:', trpcData);
    
    // Test login endpoint
    console.log('3. Testing login endpoint...');
    const loginResponse = await fetch(`${baseUrl}/api/trpc/auth.login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'masterfreq',
        password: 'freq2007'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.text();
    console.log('Login response:', loginData);
    
  } catch (error) {
    console.error('Backend test failed:', error.message);
    console.log('\nMake sure to start the backend server first:');
    console.log('bun run server.ts');
  }
}

testBackend();