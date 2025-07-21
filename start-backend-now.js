#!/usr/bin/env node

const { spawn } = require('child_process');
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

async function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8081/health', (res) => {
      console.log(`✅ Backend is already running (Status: ${res.statusCode})`);
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startBackend() {
  console.log('🚀 Starting FREQ Backend Server...\n');
  
  // Check if already running
  const isRunning = await checkBackend();
  if (isRunning) {
    console.log('Backend is already running!');
    return;
  }
  
  console.log('Starting backend server...');
  
  const backend = spawn('bun', ['run', 'server.ts'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  backend.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    console.log('\n💡 Try installing bun first:');
    console.log('   curl -fsSL https://bun.sh/install | bash');
    console.log('   source ~/.bashrc');
    console.log('   bun install');
  });

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down backend...');
    backend.kill();
    process.exit(0);
  });
}

console.log('🎵 FREQ Backend Startup');
console.log('======================\n');

const localIP = getLocalIPAddress();
console.log(`📡 Local IP: ${localIP}`);
console.log(`🌐 Backend will be available at:`);
console.log(`   • http://localhost:8081`);
console.log(`   • http://${localIP}:8081`);
console.log(`\n🔑 Admin Login:`);
console.log(`   Username: admin`);
console.log(`   Password: admin123`);
console.log('');

startBackend().catch(console.error);