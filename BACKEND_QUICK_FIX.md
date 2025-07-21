# FREQ Backend Quick Fix Guide

## 🚨 Login Error: "Cannot connect to backend server"

### Quick Solution
1. **Start Backend**: `bun run server.ts`
2. **Test Connection**: `node test-backend-simple.js`
3. **Login**: Username: `admin`, Password: `admin123`

### Step-by-Step Fix

#### 1. Start the Backend Server
```bash
# In a new terminal window
bun run server.ts
```

You should see:
```
Starting server on port 8081...
Server is running on:
  Local:   http://localhost:8081
  Network: http://YOUR_IP:8081
```

#### 2. Test the Connection
```bash
node test-backend-simple.js
```

This will test all backend endpoints and show you the status.

#### 3. Login Credentials
- **Primary**: Username: `admin`, Password: `admin123`
- **Alternative**: Username: `masterfreq`, Password: `freq2007`

### 🌐 Backend URLs
- **Health Check**: http://localhost:8081/health
- **API Base**: http://localhost:8081/api
- **tRPC Endpoint**: http://localhost:8081/api/trpc

### 📱 Mobile Development
If you're testing on a physical device:

1. **Find Your IP**:
   ```bash
   node get-ip.js
   ```

2. **Update .env.local**:
   ```
   EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP:8081
   ```

3. **Restart Expo**:
   ```bash
   expo start --tunnel
   ```

### 🔧 Automated Fix
Run the complete network fix:
```bash
node network-fix-complete.js
```

### 🚀 Start Everything at Once
```bash
# Start backend only
node start-backend-now.js

# Or start both backend and frontend
concurrently "bun run server.ts" "expo start --tunnel"
```

### 🐛 Still Having Issues?

1. **Check if port 8081 is available**:
   ```bash
   lsof -i :8081
   ```

2. **Kill any process using port 8081**:
   ```bash
   kill -9 $(lsof -t -i:8081)
   ```

3. **Install bun if not installed**:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc
   bun install
   ```

4. **Check firewall settings** - ensure port 8081 is not blocked

### ✅ Success Indicators
- Backend health check returns `{"status":"ok"}`
- Login modal accepts credentials without network errors
- Admin dashboard loads after successful login

---

**Need help?** Run `node quick-fix.js` for a summary of these steps.