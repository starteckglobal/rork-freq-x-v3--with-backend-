# FREQ App - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Backend Server
```bash
# Option 1: Check and start backend automatically
node check-backend.js

# Option 2: Start manually
bun run server.ts
```

### 2. Start the Frontend
```bash
# For web development
expo start --web --tunnel

# For mobile development
expo start --tunnel
```

### 3. For Mobile Development
Update `.env.local` with your computer's IP address:
```bash
# Find your IP address
node get-ip.js

# Update .env.local
EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP_ADDRESS:8081
```

## 🔧 Troubleshooting Network Issues

### Backend Not Starting
1. Check if port 8081 is available
2. Install dependencies: `bun install`
3. Try starting manually: `bun run server.ts`

### Connection Failed Errors
1. **For Web**: Use `http://localhost:8081`
2. **For Mobile**: Use your computer's IP address (not localhost)
3. **Test connection**: `node test-connection.js`

### Admin Login Issues
- **Default credentials**:
  - Username: `admin`
  - Password: `admin123`
- **Network errors**: Ensure backend is running on port 8081
- **Mobile**: Update `.env.local` with correct IP address

## 📱 Development Scripts

```bash
# Start both backend and frontend
node start-dev.js

# Check backend status
node check-backend.js

# Test network connection
node test-connection.js

# Find your IP address
node get-ip.js
```

## 🌐 URLs

- **Web App**: http://localhost:19006
- **Backend API**: http://localhost:8081/api
- **Backend Health**: http://localhost:8081/api/health
- **tRPC Endpoint**: http://localhost:8081/api/trpc

## ⚠️ Common Issues

1. **"Network request failed"**: Backend not running or wrong URL
2. **"Failed to fetch"**: CORS issues or server not accessible
3. **Mobile connection issues**: Use IP address instead of localhost
4. **Admin login fails**: Check backend logs and credentials

## 🔍 Debug Steps

1. Check backend status: `node check-backend.js`
2. Test connection: `node test-connection.js`
3. Check logs in terminal running `bun run server.ts`
4. Verify `.env.local` configuration
5. Try restarting both backend and frontend