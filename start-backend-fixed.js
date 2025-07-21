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

async function testConnection(url) {
  try {
    const response = await fetch(`${url}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function startBackend() {
  console.log('🚀 Starting FREQ Backend Server...\n');
  
  const localIP = getLocalIPAddress();
  console.log(`📍 Detected IP Address: ${localIP}`);
  
  // Update environment file
  updateEnvFile(localIP);
  
  console.log('\n🔧 Starting backend server...');
  
  // Start the backend server
  const backend = spawn('bun', ['run', 'server.ts'], {
    stdio: 'inherit',
    cwd: __dirname
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
  
  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test connection
  const testUrl = `http://${localIP}:8081`;
  console.log(`\n🔍 Testing connection to ${testUrl}...`);
  
  const isConnected = await testConnection(testUrl);
  if (isConnected) {
    console.log('✅ Backend server is running successfully!');
    console.log(`\n📱 URLs:`);
    console.log(`   Local:   http://localhost:8081`);
    console.log(`   Network: http://${localIP}:8081`);
    console.log(`   Health:  http://${localIP}:8081/health`);
    console.log(`   API:     http://${localIP}:8081/api`);
    console.log(`\n🔑 Admin Login:`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`\n✨ Backend is ready! You can now start the frontend with: expo start --tunnel`);
  } else {
    console.log('⚠️  Backend started but connection test failed. This might be normal during startup.');
  }
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down backend server...');
    backend.kill();
    process.exit(0);
  });
}

startBackend().catch(console.error);