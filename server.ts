import { serve } from '@hono/node-server';
import app from './backend/hono';

const port = 8081;

console.log(`🚀 Starting FREQ backend server on port ${port}...`);
console.log(`📡 API will be available at http://localhost:${port}/api/trpc`);
console.log(`🔍 Health check at http://localhost:${port}/api/health`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Server is running on http://localhost:${info.port}`);
  console.log(`🔐 Admin login: masterfreq / freq2007`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - Health: http://localhost:${info.port}/api/health`);
  console.log(`   - tRPC: http://localhost:${info.port}/api/trpc`);
  console.log(`   - Admin: http://localhost:${info.port}/admin`);
});