# Network Connection Fix Guide

## Problem
Getting "Network request failed" errors when trying to login or make API calls.

## Root Cause
The app cannot connect to the backend server running on localhost:8081.

## Solutions (Try in order)

### 1. Start the Backend Server
```bash
# Make sure the backend is running
bun run server.ts
```

### 2. Test Connection
```bash
# Test if backend is accessible
node test-connection.js
```

### 3. For Web Development
- Use: `http://localhost:8081`
- Make sure `.env.local` has: `EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081`

### 4. For Mobile Development (Physical Device)

#### Option A: Use Computer's IP Address
```bash
# Find your IP address
node get-ip.js

# Update .env.local with your IP
EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP_ADDRESS:8081
```

#### Option B: Use Tunnel Mode
```bash
# Start with tunnel (slower but works everywhere)
expo start --tunnel
```

### 5. Verify Backend is Running
Open browser and go to:
- `http://localhost:8081/api` - Should show "API is running"
- `http://localhost:8081/api/trpc` - Should show "TRPC endpoint is available"

### 6. Common Issues

#### "Network request failed"
- Backend not running → Run `bun run server.ts`
- Wrong IP address → Use `node get-ip.js` to find correct IP
- Firewall blocking → Allow port 8081 in firewall

#### "Connection refused"
- Backend not started → Run `bun run server.ts`
- Port already in use → Kill process on port 8081

#### Mobile can't connect
- Using localhost on mobile → Use computer's IP address
- Different network → Use tunnel mode

### 7. Test Login
After fixing connection, test with:
- Username: `masterfreq`
- Password: `freq2007`

## Quick Commands
```bash
# Start everything
bun run server.ts &
expo start --tunnel

# Test connection
node test-connection.js

# Find IP for mobile
node get-ip.js
```