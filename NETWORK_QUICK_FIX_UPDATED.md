# 🔧 Network Connection Fix - Updated

## Quick Fix (Recommended)

Run this single command to fix all network issues:

```bash
node network-fix-complete.js
```

This script will:
- ✅ Check if backend is running
- 🚀 Start backend if needed
- 📡 Configure network settings
- 🔍 Test connectivity
- 📱 Set up mobile development

## Manual Steps (If Quick Fix Fails)

### 1. Start Backend Server

```bash
# Option 1: Using bun (recommended)
bun run server.ts

# Option 2: Using node
node server.ts
```

### 2. Update Environment for Mobile

Edit `.env.local` and replace with your computer's IP:

```bash
# Find your IP address
node get-ip.js

# Update .env.local
EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP_ADDRESS:8081
```

### 3. Test Connection

```bash
# Test backend health
curl http://localhost:8081/health

# For mobile, test with your IP
curl http://YOUR_IP_ADDRESS:8081/health
```

## Admin Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

## Troubleshooting

### "Failed to fetch" Error

1. **Backend not running:**
   ```bash
   node network-fix-complete.js
   ```

2. **Port 8081 in use:**
   ```bash
   # Kill process using port 8081
   lsof -ti:8081 | xargs kill -9
   # Then restart
   bun run server.ts
   ```

3. **Firewall blocking connection:**
   - Allow port 8081 in your firewall
   - On macOS: System Preferences > Security & Privacy > Firewall

### Mobile Development Issues

1. **Use your computer's IP, not localhost**
2. **Ensure both devices are on same WiFi network**
3. **Update .env.local with correct IP address**

### Still Having Issues?

1. **Check backend logs:**
   ```bash
   bun run server.ts
   # Look for any error messages
   ```

2. **Verify network connectivity:**
   ```bash
   node network-fix-complete.js
   ```

3. **Reset everything:**
   ```bash
   # Kill any running processes
   pkill -f "server.ts"
   pkill -f "expo"
   
   # Restart fresh
   node network-fix-complete.js
   expo start --tunnel
   ```

## Development Workflow

### For Web Development
```bash
# Terminal 1: Start backend
bun run server.ts

# Terminal 2: Start frontend
expo start --web --tunnel
```

### For Mobile Development
```bash
# Terminal 1: Start backend
bun run server.ts

# Terminal 2: Start frontend
expo start --tunnel

# Make sure .env.local has your IP address
```

### Combined (Recommended)
```bash
# Install concurrently if not installed
npm install -g concurrently

# Start both backend and frontend
concurrently "bun run server.ts" "expo start --tunnel"
```

## Health Check URLs

- **Backend Health:** http://localhost:8081/health
- **API Endpoint:** http://localhost:8081/api
- **tRPC Endpoint:** http://localhost:8081/api/trpc

## Success Indicators

✅ Backend running: `Server is running on: Local: http://localhost:8081`
✅ Health check: `{"status":"ok","message":"Backend is running"}`
✅ Admin login: Successfully redirects to `/admin` dashboard
✅ Mobile connection: Can access from phone using IP address