import { serve } from '@hono/node-server';
import app from './backend/hono';
import os from 'os';

const port = 8081;

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const networkInterface of interfaces[name] || []) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
        return networkInterface.address;
      }
    }
  }
  
  return 'localhost';
}

const localIP = getLocalIPAddress();

console.log(`Starting server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0', // Bind to all interfaces
}, (info) => {
  console.log(`Server is running on:`);
  console.log(`  Local:   http://localhost:${info.port}`);
  console.log(`  Network: http://${localIP}:${info.port}`);
  console.log(`\nFor mobile development, update .env.local with:`);
  console.log(`EXPO_PUBLIC_RORK_API_BASE_URL=http://${localIP}:${info.port}`);
});