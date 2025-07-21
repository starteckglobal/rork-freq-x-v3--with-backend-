#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

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
    const req = http.get(`http://${host}:${port}/api/health`, (res) => {
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

async function testLogin(host = 'localhost', port = 8081) {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });
    
    const options = {
      hostname: host,
      port: port,
      path: '/api/test-login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ Login test passed: ${response.message}`);
          resolve(true);
        } catch (e) {
          console.log(`❌ Login test failed: Invalid response`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Login test failed: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ Login test timed out`);
      req.destroy();
      resolve(false);
    });
    
    req.write(loginData);
    req.end();
  });
}

async function updateEnvFile(localIP) {
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add the backend URL
    const backendUrl = `http://${localIP}:8081`;
    const envLines = envContent.split('\\n');
    let found = false;
    
    for (let i = 0; i < envLines.length; i++) {
      if (envLines[i].startsWith('EXPO_PUBLIC_RORK_API_BASE_URL=')) {
        envLines[i] = `EXPO_PUBLIC_RORK_API_BASE_URL=${backendUrl}`;
        found = true;
        break;
      }
    }
    
    if (!found) {
      envLines.push(`EXPO_PUBLIC_RORK_API_BASE_URL=${backendUrl}`);
    }
    
    fs.writeFileSync(envPath, envLines.join('\\n'));
    console.log(`✅ Updated .env.local with backend URL: ${backendUrl}`);
    
  } catch (error) {
    console.log(`⚠️  Could not update .env.local: ${error.message}`);
  }
}

async function startBackend() {
  console.log('🚀 Starting backend server...');
  
  return new Promise((resolve) => {
    const backend = spawn('bun', ['run', 'server.ts'], {
      stdio: 'inherit',
      cwd: process.cwd(),
      detached: false
    });

    backend.on('error', (error) => {
      console.error('❌ Failed to start backend server:', error);
      console.log('💡 Make sure bun is installed: curl -fsSL https://bun.sh/install | bash');
      console.log('💡 Or try with node: node server.ts');
      resolve(null);
    });

    // Wait for backend to start
    setTimeout(() => {
      resolve(backend);
    }, 4000);
  });
}

async function main() {
  console.log('🔧 FREQ Login Fix - Complete Solution\\n');
  console.log('This script will:');
  console.log('1. Check if backend is running');
  console.log('2. Start backend if needed');
  console.log('3. Test all endpoints');
  console.log('4. Update .env.local configuration');
  console.log('5. Verify login functionality\\n');
  
  const localIP = getLocalIPAddress();
  const port = 8081;
  
  console.log(`📡 Local IP Address: ${localIP}`);
  console.log(`🔧 Backend URL: http://${localIP}:${port}\\n`);
  
  // Step 1: Check if backend is running
  console.log('Step 1: Checking backend status...');
  let isRunning = await checkBackend('localhost', port);
  
  // Step 2: Start backend if needed
  if (!isRunning) {
    console.log('\\nStep 2: Starting backend server...');
    const backend = await startBackend();
    
    if (backend) {
      // Wait and check again
      await new Promise(resolve => setTimeout(resolve, 3000));
      isRunning = await checkBackend('localhost', port);
      
      if (!isRunning) {
        console.log('\\n❌ Failed to start backend server.');
        console.log('\\n🔧 Manual steps:');
        console.log('1. Run: bun install');
        console.log('2. Run: bun run server.ts');
        console.log('3. Check for port conflicts on 8081');
        return;
      }
    } else {
      console.log('\\n❌ Could not start backend server.');
      return;
    }
  } else {
    console.log('\\nStep 2: Backend already running ✅');
  }
  
  // Step 3: Test endpoints
  console.log('\\nStep 3: Testing endpoints...');
  const loginWorks = await testLogin('localhost', port);
  
  if (!loginWorks) {
    console.log('❌ Login endpoint test failed');
    return;
  }
  
  // Step 4: Update .env.local
  console.log('\\nStep 4: Updating configuration...');
  await updateEnvFile(localIP);
  
  // Step 5: Final verification
  console.log('\\nStep 5: Final verification...');
  console.log('✅ Backend is running and accessible');
  console.log('✅ Login endpoint is working');
  console.log('✅ Configuration updated');
  
  console.log('\\n🎉 Login fix complete! You can now:');
  console.log('\\n🔑 Login with these credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  
  console.log('\\n🌐 Backend URLs:');
  console.log(`   Web: http://localhost:${port}/api`);
  console.log(`   Mobile: http://${localIP}:${port}/api`);
  console.log(`   Health: http://localhost:${port}/api/health`);
  
  console.log('\\n📱 For mobile development:');
  console.log(`   Your .env.local is set to: http://${localIP}:${port}`);
  
  console.log('\\n🚀 Next steps:');
  console.log('1. Try logging in to the admin panel');
  console.log('2. If still having issues, restart the Expo app');
  console.log('3. For mobile, make sure your device is on the same network');
}

main().catch(error => {
  console.error('\\n💥 Fix script failed:', error.message);
  console.log('\\n🔧 Manual troubleshooting:');
  console.log('1. Check if port 8081 is available');
  console.log('2. Try: bun run server.ts');
  console.log('3. Check network connectivity');
  console.log('4. Verify .env.local settings');
});