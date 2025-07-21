#!/usr/bin/env node

const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

const ip = getLocalIPAddress();
console.log(`Your local IP address is: ${ip}`);
console.log(`For mobile development, update your .env.local file:`);
console.log(`EXPO_PUBLIC_RORK_API_BASE_URL=http://${ip}:8081`);
console.log(`\nOr start your backend server with:`);
console.log(`bun run server.ts`);
console.log(`\nThen start Expo with tunnel mode:`);
console.log(`expo start --tunnel`);