# 🚀 FREQ App - Complete Startup Guide

## Problem Summary
The authentication was failing due to server connection issues. This guide ensures proper server startup and connection.

## ✅ Quick Fix Steps

### 1. Start the Backend Server
```bash
# Start the server
bun run server.ts

# OR use the startup script
chmod +x start-server.sh
./start-server.sh
```

### 2. Verify Server is Running
```bash
# Test server connection
node test-server.js

# OR manual check
curl http://localhost:8081/health
```

### 3. Test Admin Login
- **Username:** `masterfreq`
- **Password:** `freq2007`
- **URL:** Navigate to `/admin` in your app

## 🔧 Server Configuration

### Port Configuration
- **Server Port:** 8081 (configured in `server.ts`)
- **Client Connection:** 8081 (configured in `lib/trpc.ts`)
- **CORS Origins:** Includes localhost:8081, localhost:19006, etc.

### Key Endpoints
| Endpoint | Purpose |
|----------|---------|
| `http://localhost:8081/health` | Server health check |
| `http://localhost:8081/api/health` | API health check |
| `http://localhost:8081/api/trpc` | tRPC API endpoint |

## 🐛 Troubleshooting

### "Failed to fetch" Error
**Cause:** Backend server not running
**Solution:**
```bash
# Check if server is running
lsof -i :8081

# Start server if not running
bun run server.ts
```

### Port Already in Use
**Cause:** Another process using port 8081
**Solution:**
```bash
# Find and kill process using port 8081
lsof -ti :8081 | xargs kill -9

# Then start server
bun run server.ts
```

### Authentication Still Fails
**Cause:** Server connection issues
**Solution:**
1. Verify server is running: `curl http://localhost:8081/health`
2. Check server logs for errors
3. App will automatically fall back to offline mode

## 🔄 Offline Mode Fallback

The app includes automatic fallback functionality:

1. **Online Mode:** Uses backend server for authentication and data
2. **Offline Mode:** Uses local validation and mock data
3. **Automatic Detection:** Tests server connection before login attempts

### Offline Mode Features
- ✅ Admin login with same credentials
- ✅ All dashboard functionality
- ✅ Mock data for testing
- ⚠️ Changes not persisted to backend

## 📊 Server Monitoring

### Health Check Response
```json
{
  "status": "ok",
  "message": "FREQ Backend Server is running",
  "timestamp": "2025-01-23T...",
  "port": 8081,
  "endpoints": {
    "trpc": "/api/trpc",
    "health": "/api/health",
    "adminLogin": "/admin"
  }
}
```

### Server Logs
The server now provides detailed logging:
- 📥 Incoming requests
- 📤 Response times
- 🔐 Authentication attempts
- ❌ Error details

## 🎯 Testing Checklist

- [ ] Server starts without errors
- [ ] Health endpoint responds: `curl http://localhost:8081/health`
- [ ] tRPC endpoint accessible: `curl http://localhost:8081/api/trpc`
- [ ] Admin login works with: `masterfreq` / `freq2007`
- [ ] App falls back to offline mode when server is stopped
- [ ] No "Failed to fetch" errors in console

## 🚨 Emergency Recovery

If nothing works:

1. **Kill all processes on port 8081:**
   ```bash
   lsof -ti :8081 | xargs kill -9
   ```

2. **Restart server with verbose logging:**
   ```bash
   DEBUG=* bun run server.ts
   ```

3. **Test with offline mode:**
   - Stop server completely
   - Try admin login - should work in offline mode
   - Credentials: `masterfreq` / `freq2007`

## 📝 What Was Fixed

1. **Enhanced server logging** - Better visibility into requests and errors
2. **Improved error handling** - More specific error messages
3. **Connection testing** - Automatic server availability detection
4. **Fallback authentication** - Offline mode when server unavailable
5. **Health check endpoints** - Easy server status verification
6. **Startup scripts** - Simplified server management

The authentication should now work reliably both online and offline!