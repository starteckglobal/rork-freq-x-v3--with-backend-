#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

async function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8081/health', (res) => {
      console.log('✅ Backend is running');
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
  console.log('🚀 Starting backend server...');
  
  const backend = spawn('bun', ['run', 'server.ts'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  backend.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    console.log('💡 Make sure bun is installed: curl -fsSL https://bun.sh/install | bash');
    process.exit(1);
  });

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down backend...');
    backend.kill();
    process.exit(0);
  });

  return backend;
}

async function main() {
  const isRunning = await checkBackend();
  
  if (isRunning) {
    console.log('✅ Backend is already running on http://localhost:8081');
    return;
  }
  
  console.log('🔄 Backend not running, starting...');
  await startBackend();
}

main().catch(console.error);