#!/usr/bin/env node

const http = require('http');
const { spawn } = require('child_process');
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

async function checkBackend(host = 'localhost', port = 8081) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}/api`, (res) => {
      console.log(`✅ Backend is running on ${host}:${port} (Status: ${res.statusCode})`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Backend not running on ${host}:${port}: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(3000, () => {
      console.log(`⏰ Connection to ${host}:${port} timed out`);
      req.destroy();
      resolve(false);
    });
  });
}

async function startBackend() {
  console.log('🚀 Starting backend server...');
  
  const backend = spawn('bun', ['run', 'server.ts'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    detached: false
  });

  backend.on('error', (error) => {
    console.error('❌ Failed to start backend server:', error);
    console.log('💡 Try running: bun install');
    console.log('💡 Or manually: bun run server.ts');
  });

  // Wait for backend to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return backend;
}

async function main() {
  console.log('🔍 Checking backend status...\n');
  
  const localIP = getLocalIPAddress();
  const port = 8081;
  
  // Check if backend is already running
  const isRunning = await checkBackend('localhost', port);
  
  if (!isRunning) {
    console.log('\n🔄 Backend not running, attempting to start...\n');
    
    const backend = await startBackend();
    
    // Check again after starting
    setTimeout(async () => {
      const isNowRunning = await checkBackend('localhost', port);
      
      if (isNowRunning) {
        console.log('\n✅ Backend started successfully!');
        console.log(`📡 Local IP: ${localIP}`);
        console.log(`🌐 Web: http://localhost:${port}`);
        console.log(`📱 Mobile: http://${localIP}:${port}`);
        console.log('\n💡 For mobile development, update .env.local with:');
        console.log(`   EXPO_PUBLIC_RORK_API_BASE_URL=http://${localIP}:${port}`);
      } else {
        console.log('\n❌ Failed to start backend. Please check for errors above.');
        console.log('💡 Try running manually: bun run server.ts');
        if (backend) backend.kill();
      }
    }, 2000);
    
  } else {
    console.log('\n✅ Backend is already running!');
    console.log(`📡 Local IP: ${localIP}`);
    console.log(`🌐 Web: http://localhost:${port}`);
    console.log(`📱 Mobile: http://${localIP}:${port}`);
  }
}

main().catch(console.error);