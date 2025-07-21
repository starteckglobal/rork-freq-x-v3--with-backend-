#!/usr/bin/env node

const http = require('http');
const https = require('https');
const os = require('os');
const { spawn } = require('child_process');

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

async function testEndpoint(url, timeout = 5000) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          data: data.substring(0, 200) // First 200 chars
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function checkPort(host, port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(3000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function main() {
  console.log('🔍 FREQ Network Diagnostics\n');
  
  const localIP = getLocalIPAddress();
  const port = 8081;
  
  console.log(`📡 Network Information:`);
  console.log(`   Local IP: ${localIP}`);
  console.log(`   Target Port: ${port}\n`);
  
  // Check if port is open
  console.log('🔌 Port Connectivity:');
  const localhostOpen = await checkPort('localhost', port);
  const ipOpen = await checkPort(localIP, port);
  
  console.log(`   localhost:${port} - ${localhostOpen ? '✅ Open' : '❌ Closed'}`);
  console.log(`   ${localIP}:${port} - ${ipOpen ? '✅ Open' : '❌ Closed'}\n`);
  
  if (!localhostOpen && !ipOpen) {
    console.log('❌ Backend server is not running on port 8081');
    console.log('💡 Start it with: bun run server.ts\n');
    return;
  }
  
  // Test API endpoints
  console.log('🌐 API Endpoint Tests:');
  
  const endpoints = [
    `http://localhost:${port}/api`,
    `http://localhost:${port}/api/health`,
    `http://localhost:${port}/api/trpc`,
    `http://${localIP}:${port}/api`,
  ];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    if (result.success) {
      console.log(`   ✅ ${endpoint} - Status: ${result.status}`);
    } else {
      console.log(`   ❌ ${endpoint} - Error: ${result.error}`);
    }
  }
  
  console.log('\n📋 Environment Check:');
  
  // Check .env.local
  const fs = require('fs');
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const baseUrlMatch = envContent.match(/EXPO_PUBLIC_RORK_API_BASE_URL=(.+)/);
    if (baseUrlMatch) {
      console.log(`   📄 .env.local: ${baseUrlMatch[1]}`);
    } else {
      console.log(`   📄 .env.local: No EXPO_PUBLIC_RORK_API_BASE_URL found`);
    }
  } else {
    console.log(`   📄 .env.local: File not found`);
  }
  
  console.log('\n🔧 Recommendations:');
  
  if (localhostOpen) {
    console.log('   ✅ Backend is running locally');
    console.log('   🌐 For web development: Use http://localhost:8081');
    
    if (ipOpen) {
      console.log(`   📱 For mobile development: Use http://${localIP}:8081`);
      console.log(`   💡 Update .env.local with: EXPO_PUBLIC_RORK_API_BASE_URL=http://${localIP}:8081`);
    } else {
      console.log('   ⚠️  Mobile development may not work (IP not accessible)');
      console.log('   💡 Check firewall settings or use tunnel mode');
    }
  } else {
    console.log('   ❌ Start backend server: bun run server.ts');
  }
  
  console.log('\n🚀 Quick Commands:');
  console.log('   Backend: bun run server.ts');
  console.log('   Frontend: expo start --tunnel');
  console.log('   Both: node start-dev.js');
}

main().catch(console.error);