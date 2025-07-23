import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes with more permissive settings for development
app.use("*", cors({
  origin: ['http://localhost:8081', 'http://localhost:19006', 'http://127.0.0.1:8081', 'http://127.0.0.1:19006', 'http://localhost:3000', 'http://localhost:8082'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Add logging middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  console.log(`📥 ${c.req.method} ${c.req.url}`);
  await next();
  const duration = Date.now() - start;
  console.log(`📤 ${c.req.method} ${c.req.url} - ${duration}ms`);
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

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "FREQ Backend Server is running",
    timestamp: new Date().toISOString(),
    port: 8081,
    endpoints: {
      trpc: "/api/trpc",
      health: "/api/health",
      adminLogin: "/admin"
    }
  });
});

// Test endpoint for payment system
app.get("/api/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "FREQ API is running",
    timestamp: new Date().toISOString(),
    port: 8081,
    endpoints: {
      trpc: "/api/trpc",
      health: "/api/health"
    }
  });
});

export default app;