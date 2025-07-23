#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FREQ Backend Server...');
console.log('📍 Server will be available at: http://localhost:8081');
console.log('📍 tRPC endpoint: http://localhost:8081/api/trpc');
console.log('');

// Start the backend server using bun
const backend = spawn('bun', ['run', 'server.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
  console.log('');
  console.log('💡 Make sure you have bun installed:');
  console.log('   curl -fsSL https://bun.sh/install | bash');
  console.log('');
  console.log('💡 Or try with node:');
  console.log('   node server.ts');
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`\n🛑 Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill('SIGTERM');
});

// Show helpful information
setTimeout(() => {
  console.log('');
  console.log('ℹ️  Backend Server Information:');
  console.log('   • Health Check: http://localhost:8081/api');
  console.log('   • tRPC Endpoint: http://localhost:8081/api/trpc');
  console.log('   • Admin Login: Use credentials in the app');
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('   • Make sure port 8081 is not in use');
  console.log('   • Check firewall settings if connection fails');
  console.log('   • For mobile testing, update IP address in lib/trpc.ts');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
}, 2000);