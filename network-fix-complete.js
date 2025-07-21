#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const http = require('http');
const { spawn } = require('child_process');

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

function updateEnvFile(ip) {
  const envPath = '.env.local';
  const newUrl = `http://${ip}:8081`;
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add the base URL
  if (envContent.includes('EXPO_PUBLIC_RORK_API_BASE_URL=')) {
    envContent = envContent.replace(
      /EXPO_PUBLIC_RORK_API_BASE_URL=.*/,
      `EXPO_PUBLIC_RORK_API_BASE_URL=${newUrl}`
    );
  } else {
    envContent += `\n# Auto-configured for mobile development\nEXPO_PUBLIC_RORK_API_BASE_URL=${newUrl}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Updated .env.local with: ${newUrl}`);
}

async function checkBackend(host = 'localhost', port = 8081) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}/health`, (res) => {
      console.log(`✅ Backend is running on ${host}:${port} (Status: ${res.statusCode})`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Backend not accessible on ${host}:${port}: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(3000, () => {
      console.log(`⏰ Connection to ${host}:${port} timed out`);
      req.destroy();
      resolve(false);
    });
  });
}

async function startBackend() {
  console.log('🚀 Starting backend server...');
  
  return new Promise((resolve, reject) => {
    const backend = spawn('bun', ['run', 'server.ts'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    let output = '';
    
    backend.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text.trim());
      
      // Check if server started successfully
      if (text.includes('Server is running on')) {
        setTimeout(() => resolve(backend), 1000);
      }
    });

    backend.stderr.on('data', (data) => {
      const text = data.toString();
      console.error(text.trim());
    });

    backend.on('error', (error) => {
      console.error('❌ Failed to start backend:', error.message);
      reject(error);
    });

    backend.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Backend exited with code ${code}`);
        reject(new Error(`Backend process exited with code ${code}`));
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!output.includes('Server is running on')) {
        console.error('❌ Backend startup timeout');
        backend.kill();
        reject(new Error('Backend startup timeout'));
      }
    }, 10000);
  });
}

async function main() {
  console.log('🔧 FREQ Complete Network Fix\n');
  
  const localIP = getLocalIPAddress();
  console.log(`📡 Detected IP Address: ${localIP}\n`);
  
  // Step 1: Check if backend is running
  console.log('1️⃣ Checking backend server...');
  let isRunning = await checkBackend('localhost', 8081);
  
  if (!isRunning) {
    console.log('\n🔄 Backend not running, starting...\n');
    
    try {
      const backend = await startBackend();
      console.log('\n✅ Backend started successfully!');
      
      // Verify it's actually running
      await new Promise(resolve => setTimeout(resolve, 2000));
      isRunning = await checkBackend('localhost', 8081);
      
      if (!isRunning) {
        console.log('❌ Backend started but not responding to health checks');
        return;
      }
    } catch (error) {
      console.error('❌ Failed to start backend:', error.message);
      console.log('\n💡 Manual steps:');
      console.log('   1. Install bun: curl -fsSL https://bun.sh/install | bash');
      console.log('   2. Install dependencies: bun install');
      console.log('   3. Start backend: bun run server.ts');
      return;
    }
  }
  
  // Step 2: Update environment file for mobile
  console.log('\n2️⃣ Updating environment configuration...');
  updateEnvFile(localIP);
  
  // Step 3: Test connectivity
  console.log('\n3️⃣ Testing connectivity...');
  const webConnectivity = await checkBackend('localhost', 8081);
  const mobileConnectivity = await checkBackend(localIP, 8081);
  
  console.log('\n📊 Connectivity Status:');
  console.log(`   🌐 Web (localhost): ${webConnectivity ? '✅ Working' : '❌ Failed'}`);
  console.log(`   📱 Mobile (${localIP}): ${mobileConnectivity ? '✅ Working' : '❌ Failed'}`);
  
  // Step 4: Provide next steps
  console.log('\n4️⃣ Next Steps:');
  console.log('   🌐 For web development: expo start --web --tunnel');
  console.log('   📱 For mobile development: expo start --tunnel');
  console.log('   🚀 Start both: concurrently "bun run server.ts" "expo start --tunnel"');
  
  console.log('\n✅ Network configuration complete!');
  console.log(`   Backend Health: http://localhost:8081/health`);
  console.log(`   Backend API: http://localhost:8081/api`);
  console.log(`   tRPC Endpoint: http://localhost:8081/api/trpc`);
  
  console.log('\n🔑 Admin Login Credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  
  if (!webConnectivity || !mobileConnectivity) {
    console.log('\n⚠️  Some connectivity issues detected. Try:');
    console.log('   • Restart the backend: bun run server.ts');
    console.log('   • Check firewall settings');
    console.log('   • Ensure port 8081 is available');
  }
}

main().catch(console.error);