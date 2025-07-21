#!/usr/bin/env node

const http = require('http');
const os = require('os');

function getLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  
  for (const name of Object.keys(networkInterfaces)) {
    const networkInterface = networkInterfaces[name];
    if (networkInterface) {
      for (const iface of networkInterface) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  
  return 'localhost';
}

async function testConnection(host, port) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}/api`, (res) => {
      console.log(`✅ Connection to ${host}:${port} successful (Status: ${res.statusCode})`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Connection to ${host}:${port} failed: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ Connection to ${host}:${port} timed out`);
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🔍 Testing backend connections...\n');
  
  const localIP = getLocalIPAddress();
  const port = 8081;
  
  console.log(`Local IP Address: ${localIP}`);
  console.log(`Testing connections on port ${port}:\n`);
  
  // Test localhost
  await testConnection('localhost', port);
  await testConnection('127.0.0.1', port);
  
  // Test local IP
  if (localIP !== 'localhost') {
    await testConnection(localIP, port);
  }
  
  console.log('\n📋 Setup Instructions:');
  console.log('1. Start the backend server: bun run server.ts');
  console.log('2. For web development: Use http://localhost:8081');
  console.log(`3. For mobile development: Update .env.local with:`);
  console.log(`   EXPO_PUBLIC_RORK_API_BASE_URL=http://${localIP}:${port}`);
  console.log('4. Start Expo with tunnel: expo start --tunnel');
}

main().catch(console.error);