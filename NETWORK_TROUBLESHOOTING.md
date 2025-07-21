# Network Troubleshooting Guide

## Quick Fix for "Network request failed" Error

### Step 1: Start the Backend Server
```bash
bun run server.ts
```

You should see output like:
```
Starting server on port 8081...
Server is running on:
  Local:   http://localhost:8081
  Network: http://192.168.1.100:8081

For mobile development, update .env.local with:
EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.100:8081
```

### Step 2: Configure for Your Platform

#### For Web Development (localhost)
- Keep `.env.local` as: `EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081`
- Start Expo: `expo start --web`

#### For Mobile Development (Physical Device)
1. Note the "Network" IP address from the server output
2. Update `.env.local` with that IP:
   ```
   EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.100:8081
   ```
3. Start Expo with tunnel: `expo start --tunnel`

#### For Mobile Development (Simulator/Emulator)
- iOS Simulator: Use `http://localhost:8081`
- Android Emulator: Use `http://10.0.2.2:8081`

### Step 3: Test the Connection

Run this to test if the backend is accessible:
```bash
node test-backend.js
```

Or manually test:
```bash
curl http://localhost:8081/api
```

## Common Issues and Solutions

### 1. "Network request failed" on Mobile
**Problem**: Mobile app can't reach localhost
**Solution**: 
- Use your computer's IP address in `.env.local`
- Or use tunnel mode: `expo start --tunnel`

### 2. "Failed to fetch" Error
**Problem**: Backend server is not running
**Solution**: Start the backend with `bun run server.ts`

### 3. CORS Errors
**Problem**: Cross-origin requests blocked
**Solution**: The backend is configured to allow all origins in development

### 4. Timeout Errors
**Problem**: Requests taking too long
**Solution**: Check network connection and server status

### 5. Port Already in Use
**Problem**: Port 8081 is occupied
**Solution**: 
- Kill the process using the port
- Or change the port in `server.ts`

## Development Workflow

### Terminal 1: Backend Server
```bash
bun run server.ts
```

### Terminal 2: Expo App
```bash
# For web
expo start --web

# For mobile with tunnel
expo start --tunnel
```

## Admin Login Credentials
- Username: `masterfreq`
- Password: `freq2007`

## Network Configuration Details

The app automatically detects the platform and uses appropriate URLs:
- **Web**: `http://localhost:8081`
- **Mobile**: Uses `EXPO_PUBLIC_RORK_API_BASE_URL` from `.env.local`
- **Fallback**: `http://localhost:8081`

## Testing Endpoints

- Health Check: `GET /api`
- TRPC Health: `GET /api/trpc`
- Login: `POST /api/trpc/auth.login`

## Debugging Tips

1. Check console logs for network requests
2. Verify the backend server is running and accessible
3. Ensure `.env.local` has the correct IP for mobile
4. Use tunnel mode for easier mobile development
5. Check firewall settings if using IP addresses