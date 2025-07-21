#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
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

async function checkAndStartBackend() {
  return new Promise((resolve) => {
    const http = require('http');
    
    const req = http.get('http://localhost:8081/api', (res) => {
      console.log('✅ Backend is already running');
      resolve(true);
    });

    req.on('error', () => {
      console.log('🔄 Starting backend server...');
      
      const backend = spawn('bun', ['run', 'server.ts'], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      backend.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      backend.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      backend.on('error', (error) => {
        console.error('❌ Failed to start backend:', error.message);
        console.log('💡 Try running manually: bun run server.ts');
        resolve(false);
      });

      // Give it time to start
      setTimeout(() => {
        console.log('✅ Backend startup initiated');
        resolve(true);
      }, 3000);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🔧 FREQ Network Auto-Fix\n');
  
  const localIP = getLocalIPAddress();
  console.log(`📡 Detected IP Address: ${localIP}\n`);
  
  // Step 1: Check and start backend
  console.log('1️⃣ Checking backend server...');
  const backendStarted = await checkAndStartBackend();
  
  if (!backendStarted) {
    console.log('❌ Could not start backend. Please run manually: bun run server.ts');
    return;
  }
  
  // Step 2: Update environment file
  console.log('\n2️⃣ Updating environment configuration...');
  updateEnvFile(localIP);
  
  // Step 3: Provide next steps
  console.log('\n3️⃣ Next Steps:');
  console.log('   🌐 For web: expo start --web --tunnel');
  console.log('   📱 For mobile: expo start --tunnel');
  console.log('   🚀 Or use: node start-dev.js');
  
  console.log('\n✅ Network configuration complete!');
  console.log(`   Backend: http://localhost:8081`);
  console.log(`   Mobile: http://${localIP}:8081`);
  
  console.log('\n🔍 To verify everything works:');
  console.log('   node diagnose-network.js');
}

main().catch(console.error);