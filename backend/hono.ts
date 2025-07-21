import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes with more permissive settings for development
app.use("*", cors({
  origin: (origin) => {
    console.log('CORS origin:', origin);
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return origin || '*'; // Return the origin or wildcard in development
    }
    
    // In production, specify allowed origins
    const allowedOrigins = [
      'http://localhost:8081', 
      'http://localhost:19006', 
      'http://127.0.0.1:8081', 
      'http://127.0.0.1:19006', 
      'http://localhost:3000'
    ];
    
    // Also allow tunnel URLs (they typically contain .ngrok.io or similar)
    if (origin && (origin.includes('.ngrok.io') || origin.includes('.tunnel.') || origin.includes('exp://'))) {
      return origin;
    }
    
    return allowedOrigins.includes(origin || '') ? origin : null;
  },
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
  return c.json({ status: "ok", message: "API is running" });
});

// Health check for TRPC
app.get("/trpc", (c) => {
  return c.json({ status: "ok", message: "TRPC endpoint is available" });
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
    }
  });
});

export default app;