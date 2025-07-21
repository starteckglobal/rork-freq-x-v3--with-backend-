#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  
  for (const name of Object.keys(networkInterfaces)) {
    const networkInterface = networkInterfaces[name];
    if (networkInterface) {
      for (const netInterface of networkInterface) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (netInterface.family === 'IPv4' && !netInterface.internal) {
          return netInterface.address;
        }
      }
    }
  }
  
  return 'localhost';
}

function updateEnvFile(ip) {
  const envPath = path.join(__dirname, '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add the API base URL
  const newUrl = `http://${ip}:8081`;
  const envLines = envContent.split('\n');
  let found = false;
  
  for (let i = 0; i < envLines.length; i++) {
    if (envLines[i].startsWith('EXPO_PUBLIC_RORK_API_BASE_URL=')) {
      envLines[i] = `EXPO_PUBLIC_RORK_API_BASE_URL=${newUrl}`;
      found = true;
      break;
    }
  }
  
  if (!found) {
    envLines.unshift(`EXPO_PUBLIC_RORK_API_BASE_URL=${newUrl}`);
  }
  
  fs.writeFileSync(envPath, envLines.join('\n'));
  console.log(`✅ Updated .env.local with: EXPO_PUBLIC_RORK_API_BASE_URL=${newUrl}`);
}

async function testConnection(url, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${url}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Health check passed:`, data.message);
        return true;
      }
    } catch (error) {
      console.log(`⏳ Connection attempt ${i + 1}/${maxRetries} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

async function testTRPCConnection(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${url}/api/trpc`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ TRPC endpoint is accessible');
      return true;
    }
  } catch (error) {
    console.log('⚠️  TRPC endpoint test failed:', error.message);
  }
  return false;
}

async function testLogin(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${url}/test-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login test passed:', data.message);
      return true;
    }
  } catch (error) {
    console.log('⚠️  Login test failed:', error.message);
  }
  return false;
}

function killExistingProcesses() {
  return new Promise((resolve) => {
    const killProcess = spawn('pkill', ['-f', 'server.ts'], { stdio: 'ignore' });
    killProcess.on('close', () => {
      setTimeout(resolve, 1000); // Wait a bit for processes to fully terminate
    });
  });
}

async function startBackend() {
  console.log('🚀 Starting FREQ Backend Server (Complete Fix)...\n');
  
  // Kill any existing backend processes
  console.log('🧹 Cleaning up existing processes...');
  await killExistingProcesses();
  
  const localIP = getLocalIPAddress();
  console.log(`📍 Detected IP Address: ${localIP}`);
  
  // Update environment file
  updateEnvFile(localIP);
  
  console.log('\n🔧 Starting backend server...');
  
  // Start the backend server with proper error handling
  const backend = spawn('bun', ['run', 'server.ts'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  let serverReady = false;
  
  backend.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    
    // Check if server is ready
    if (output.includes('Server is running on:')) {
      serverReady = true;
    }
  });
  
  backend.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(output);
  });
  
  backend.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  });
  
  backend.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Backend exited with code ${code}`);
      process.exit(1);
    }
  });
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server to start...');
  let attempts = 0;
  while (!serverReady && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  if (!serverReady) {
    console.log('⚠️  Server startup detection timed out, proceeding with tests...');
  }
  
  // Test connections
  const testUrl = `http://${localIP}:8081`;
  console.log(`\n🔍 Testing connections to ${testUrl}...`);
  
  const healthOk = await testConnection(testUrl);
  if (!healthOk) {
    console.error('❌ Health check failed - backend may not be running properly');
    return;
  }
  
  const trpcOk = await testTRPCConnection(testUrl);
  const loginOk = await testLogin(testUrl);
  
  console.log('\n📊 Connection Test Results:');
  console.log(`   Health Check: ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   TRPC Endpoint: ${trpcOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Login Test: ${loginOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthOk && trpcOk && loginOk) {
    console.log('\n🎉 All tests passed! Backend is fully operational.');
  } else {
    console.log('\n⚠️  Some tests failed, but basic connectivity is working.');
  }
  
  console.log(`\n📱 Server URLs:`);
  console.log(`   Local:   http://localhost:8081`);
  console.log(`   Network: http://${localIP}:8081`);
  console.log(`   Health:  http://${localIP}:8081/health`);
  console.log(`   API:     http://${localIP}:8081/api`);
  console.log(`   TRPC:    http://${localIP}:8081/api/trpc`);
  
  console.log(`\n🔑 Admin Credentials:`);
  console.log(`   Username: admin`);
  console.log(`   Password: admin123`);
  
  console.log(`\n🚀 Next Steps:`);
  console.log(`   1. Keep this terminal open (backend server)`);
  console.log(`   2. Open new terminal and run: expo start --tunnel`);
  console.log(`   3. Try logging in with admin/admin123`);
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down backend server...');
    backend.kill('SIGTERM');
    setTimeout(() => {
      backend.kill('SIGKILL');
      process.exit(0);
    }, 5000);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    backend.kill('SIGTERM');
    setTimeout(() => {
      backend.kill('SIGKILL');
      process.exit(0);
    }, 5000);
  });
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

startBackend().catch((error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});