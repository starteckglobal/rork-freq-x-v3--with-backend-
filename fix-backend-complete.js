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
  return newUrl;
}

async function testConnection(url) {
  try {
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function testLogin(url) {
  try {
    const response = await fetch(`${url}/test-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔧 FREQ Backend Complete Fix\n');
  
  const localIP = getLocalIPAddress();
  console.log(`📍 Detected IP: ${localIP}`);
  
  // Update environment
  const apiUrl = updateEnvFile(localIP);
  console.log(`✅ Updated .env.local: ${apiUrl}`);
  
  console.log('\n🚀 Starting backend server...');
  
  // Start backend
  const backend = spawn('bun', ['run', 'server.ts'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: __dirname
  });
  
  let serverReady = false;
  
  backend.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output.trim());
    if (output.includes('Server is running')) {
      serverReady = true;
    }
  });
  
  backend.stderr.on('data', (data) => {
    console.error('Backend error:', data.toString().trim());
  });
  
  backend.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  });
  
  // Wait for server to start
  console.log('⏳ Waiting for server to start...');
  let attempts = 0;
  const maxAttempts = 30;
  
  while (!serverReady && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
    
    if (attempts % 5 === 0) {
      console.log(`   Still waiting... (${attempts}/${maxAttempts})`);
    }
  }
  
  if (!serverReady) {
    console.log('⚠️  Server may still be starting. Testing connection...');
  }
  
  // Test connections
  console.log('\n🧪 Testing connections...');
  
  const healthOk = await testConnection(apiUrl);
  const loginOk = await testLogin(apiUrl);
  
  console.log(`   Health check: ${healthOk ? '✅' : '❌'}`);
  console.log(`   Login test: ${loginOk ? '✅' : '❌'}`);
  
  if (healthOk && loginOk) {
    console.log('\n🎉 Backend is working perfectly!');
    console.log(`\n📱 URLs:`);
    console.log(`   Backend: ${apiUrl}`);
    console.log(`   Health: ${apiUrl}/health`);
    console.log(`   API: ${apiUrl}/api`);
    console.log(`\n🔑 Admin Login:`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`\n✨ Ready! Start frontend: expo start --tunnel`);
  } else {
    console.log('\n⚠️  Backend started but some tests failed.');
    console.log('This might be normal during startup. Try the login again in a moment.');
  }
  
  // Keep running
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    backend.kill();
    process.exit(0);
  });
  
  console.log('\n💡 Press Ctrl+C to stop the backend server');
}

main().catch(console.error);