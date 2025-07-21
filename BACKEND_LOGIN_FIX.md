# 🔧 Backend Login Fix Guide

## Quick Fix (Recommended)

Run this single command to fix all login issues:

```bash
node fix-login-complete.js
```

This script will:
- ✅ Check if backend is running
- ✅ Start backend if needed  
- ✅ Test all endpoints
- ✅ Update .env.local configuration
- ✅ Verify login functionality

## Manual Steps

If the quick fix doesn't work, follow these steps:

### 1. Start Backend Server

```bash
# Option 1: Using the simple starter
node start-backend-simple.js

# Option 2: Direct command
bun run server.ts

# Option 3: If bun is not available
node server.ts
```

### 2. Test Backend Connection

```bash
node test-backend-connection.js
```

### 3. Update Environment Configuration

For **web development** (default):
```env
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081
```

For **mobile development**, find your IP address:
```bash
node get-ip.js
```

Then update `.env.local`:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP_ADDRESS:8081
```

## Login Credentials

```
Username: admin
Password: admin123
```

## Backend URLs

- **Health Check**: http://localhost:8081/api/health
- **TRPC Endpoint**: http://localhost:8081/api/trpc
- **Test Login**: http://localhost:8081/api/test-login

## Common Issues & Solutions

### "Cannot connect to backend server"
- ✅ Run: `node fix-login-complete.js`
- ✅ Check if port 8081 is available
- ✅ Restart backend: `bun run server.ts`

### "Network request failed"
- ✅ For mobile: Use your computer's IP address
- ✅ Ensure device is on same network
- ✅ Update .env.local with correct IP

### "Login failed" / "Invalid credentials"
- ✅ Use: Username `admin`, Password `admin123`
- ✅ Check backend logs for errors
- ✅ Test with: `node test-backend-connection.js`

### Backend won't start
- ✅ Install dependencies: `bun install`
- ✅ Check port 8081 availability
- ✅ Try with node: `node server.ts`

## Verification Steps

1. **Backend Running**: Visit http://localhost:8081/api/health
2. **TRPC Working**: Visit http://localhost:8081/api/trpc  
3. **Login Test**: Run `node test-backend-connection.js`
4. **Mobile Config**: Check .env.local has correct IP

## Development Workflow

1. **Start Backend**: `node start-backend-simple.js`
2. **Start Frontend**: `expo start --tunnel`
3. **Test Login**: Use admin/admin123 credentials
4. **For Mobile**: Update .env.local with your IP

## Need Help?

If you're still having issues:

1. Run the complete fix: `node fix-login-complete.js`
2. Check the console logs for specific error messages
3. Verify your network configuration
4. Ensure backend dependencies are installed: `bun install`