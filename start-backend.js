#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting SyncLab backend server...');

// Start the backend server using bun
const backend = spawn('bun', ['run', 'server.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

backend.on('error', (error) => {
  console.error('Failed to start backend server:', error);
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down backend server...');
  backend.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down backend server...');
  backend.kill('SIGTERM');
});