import { serve } from '@hono/node-server';
import app from './backend/hono';

const port = 8081;

console.log(`Starting server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});