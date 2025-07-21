#!/usr/bin/env node

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

const localIP = getLocalIPAddress();

console.log('🚀 Starting FREQ Development Environment...\n');
console.log(`📡 Local IP Address: ${localIP}`);
console.log(`🔧 Backend will run on: http://${localIP}:8081`);
console.log(`📱 For mobile development, update .env.local with:`);
console.log(`   EXPO_PUBLIC_RORK_API_BASE_URL=http://${localIP}:8081\n`);

// Start backend server
console.log('🔄 Starting backend server...');
const backend = spawn('bun', ['run', 'server.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
  process.exit(1);
});

// Wait a moment for backend to start, then start Expo
setTimeout(() => {
  console.log('🔄 Starting Expo development server...');
  const expo = spawn('expo', ['start', '--tunnel'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  expo.on('error', (error) => {
    console.error('❌ Failed to start Expo:', error);
    backend.kill();
    process.exit(1);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    backend.kill('SIGINT');
    expo.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down development servers...');
    backend.kill('SIGTERM');
    expo.kill('SIGTERM');
    process.exit(0);
  });
}, 3000);