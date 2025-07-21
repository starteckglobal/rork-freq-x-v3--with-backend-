import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes with more permissive settings for development
app.use("*", cors({
  origin: true, // Allow all origins in development
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-trpc-source', 'x-requested-with'],
  credentials: true,
}));

// Add logging middleware
app.use("*", async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`TRPC Error on ${path}:`, error);
    },
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "FREQ Backend API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Health check for TRPC
app.get("/trpc", (c) => {
  return c.json({ status: "ok", message: "TRPC endpoint is available" });
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Backend is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      trpc: "/api/trpc",
      health: "/api/health"
    },
    adminCredentials: {
      username: "admin",
      password: "admin123"
    }
  });
});

// Test endpoint for payment system
app.get("/api/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Backend is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      trpc: "/api/trpc",
      health: "/api/health"
    },
    adminCredentials: {
      username: "admin", 
      password: "admin123"
    }
  });
});

// Simple test endpoint for login
app.post("/test-login", async (c) => {
  try {
    const body = await c.req.json();
    console.log('Test login attempt:', body);
    
    if (body.username === 'admin' && body.password === 'admin123') {
      return c.json({ success: true, message: 'Login successful' });
    }
    
    return c.json({ success: false, message: 'Invalid credentials' }, 401);
  } catch (error) {
    console.error('Test login error:', error);
    return c.json({ success: false, message: 'Server error' }, 500);
  }
});

export default app;