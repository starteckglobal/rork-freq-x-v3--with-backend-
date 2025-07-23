# FREQ App - Quick Start Guide

## 🚀 Starting the Application

### Option 1: Start Everything Together
```bash
# Install dependencies (if not already done)
bun install

# Start both frontend and backend
node start-server.js &
expo start --tunnel
```

### Option 2: Start Separately

**Start Backend Server:**
```bash
# Method 1: Using the helper script
node start-server.js

# Method 2: Direct command
bun run server.ts

# Method 3: Using the original script
node start-backend.js
```

**Start Frontend:**
```bash
expo start --tunnel
```

## 🔐 Admin Login

**Credentials:**
- Username: `masterfreq`
- Password: `freq2007`

**Access Methods:**
1. **With Backend Running**: Full functionality with tRPC authentication
2. **Without Backend**: Offline mode with limited functionality

## 🌐 Server Information

- **Backend URL**: http://localhost:8081
- **tRPC Endpoint**: http://localhost:8081/api/trpc
- **Health Check**: http://localhost:8081/api

## 🔧 Troubleshooting

### "Failed to fetch" or "Network request failed" errors:

1. **Check if backend is running**:
   ```bash
   curl http://localhost:8081/api
   ```

2. **Start the backend server**:
   ```bash
   node start-server.js
   ```

3. **Check port availability**:
   ```bash
   lsof -i :8081
   ```

### Mobile Device Testing:

1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep inet
   
   # Windows
   ipconfig
   ```

2. Update `lib/trpc.ts` with your IP address:
   ```typescript
   return 'http://YOUR_IP_ADDRESS:8081';
   ```

## 📱 Features

- **Music Streaming**: Browse and play tracks
- **Admin Dashboard**: User management, content moderation
- **Payment System**: Stripe integration (demo mode)
- **Analytics**: User engagement and revenue tracking
- **Sync Lab**: Music collaboration features

## 🛠️ Development

The app uses:
- **Frontend**: React Native with Expo
- **Backend**: Hono.js with tRPC
- **Database**: Mock data (in-memory)
- **Authentication**: JWT tokens
- **Payments**: Stripe (demo mode)

For production deployment, replace mock data with real database connections and configure proper environment variables.