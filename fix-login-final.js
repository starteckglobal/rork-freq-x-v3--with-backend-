#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

console.log('🔧 FREQ Backend Login Fix - Final Solution\n');

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
  console.log(`✅ Updated .env.local: ${newUrl}`);
}

async function killExistingProcesses() {
  return new Promise((resolve) => {
    console.log('🧹 Cleaning up existing processes...');
    const killProcess = spawn('pkill', ['-f', 'server.ts'], { stdio: 'ignore' });
    killProcess.on('close', () => {
      setTimeout(resolve, 2000);
    });
  });
}

async function testConnection(url, maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${url}/health`, { timeout: 3000 });
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Backend connected: ${data.message}`);
        return true;
      }
    } catch (error) {
      if (i < maxAttempts - 1) {
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  return false;
}

async function testFullStack(baseUrl) {
  console.log('\n🧪 Running comprehensive tests...');
  
  const tests = [
    { name: 'Health Check', url: `${baseUrl}/health` },
    { name: 'API Root', url: `${baseUrl}/api` },
    { name: 'TRPC Endpoint', url: `${baseUrl}/api/trpc` }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url, { timeout: 5000 });
      if (response.ok) {
        console.log(`✅ ${test.name}: PASS`);
      } else {
        console.log(`❌ ${test.name}: HTTP ${response.status}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      allPassed = false;
    }
  }
  
  // Test login
  try {
    const response = await fetch(`${baseUrl}/test-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Login Test: PASS - ${data.message}`);
    } else {
      console.log(`❌ Login Test: HTTP ${response.status}`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ Login Test: ${error.message}`);
    allPassed = false;
  }
  
  return allPassed;
}

async function main() {
  try {
    // Step 1: Clean up
    await killExistingProcesses();
    
    // Step 2: Get IP and update env
    const localIP = getLocalIPAddress();
    console.log(`📍 IP Address: ${localIP}`);
    updateEnvFile(localIP);
    
    // Step 3: Start backend
    console.log('\n🚀 Starting backend server...');
    const backend = spawn('bun', ['run', 'server.ts'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    let serverOutput = '';
    backend.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      process.stdout.write(output);
    });
    
    backend.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
    
    backend.on('error', (error) => {
      console.error('❌ Backend failed to start:', error.message);
      process.exit(1);
    });
    
    // Step 4: Wait and test
    console.log('\n⏳ Waiting for server to be ready');
    process.stdout.write('Testing connection');
    
    const baseUrl = `http://${localIP}:8081`;
    const connected = await testConnection(baseUrl);
    
    if (!connected) {
      console.log('\n❌ Failed to connect to backend after multiple attempts');
      console.log('🔍 Troubleshooting:');
      console.log('   1. Check if port 8081 is available');
      console.log('   2. Try running: lsof -i :8081');
      console.log('   3. Check firewall settings');
      process.exit(1);
    }
    
    // Step 5: Run comprehensive tests
    const allTestsPassed = await testFullStack(baseUrl);
    
    // Step 6: Results
    console.log('\n📊 Final Results:');
    if (allTestsPassed) {
      console.log('🎉 SUCCESS! All systems are working correctly.');
      console.log('\n📱 Server Information:');
      console.log(`   Local:   http://localhost:8081`);
      console.log(`   Network: http://${localIP}:8081`);
      console.log(`   Health:  http://${localIP}:8081/health`);
      console.log(`   API:     http://${localIP}:8081/api/trpc`);
      console.log('\n🔑 Admin Login:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('\n🚀 Next Steps:');
      console.log('   1. Keep this terminal open (backend running)');
      console.log('   2. Open new terminal: expo start --tunnel');
      console.log('   3. Login with admin/admin123');
      console.log('\n✨ Login should now work without errors!');
    } else {
      console.log('⚠️  Some tests failed, but basic connectivity works.');
      console.log('   Try logging in - it might still work.');
    }
    
    // Keep running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      backend.kill('SIGTERM');
      setTimeout(() => process.exit(0), 2000);
    });
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();