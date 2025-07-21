# Network Issues Quick Fix Guide

## The Problem
You're seeing these errors:
- `ERROR Network request failed: [TypeError: Network request failed]`
- `ERROR Login attempt failed: [TRPCClientError: Network request failed]`

## Quick Solutions

### 1. Start the Backend Server
The most common issue is that the backend server isn't running.

```bash
# Start the backend server
bun run server.ts
```

You should see output like:
```
Starting server on port 8081...
Server is running on:
  Local:   http://localhost:8081
  Network: http://192.168.1.100:8081
```

### 2. Test Backend Connection
```bash
# Test if backend is responding
node test-backend-health.js
```

### 3. For Mobile Development
If you're testing on a physical device, update `.env.local`:

```bash
# Find your computer's IP address
node get-ip.js
```

Then update `.env.local`:
```
EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP_ADDRESS:8081
```

### 4. Start Everything Together
Use the development script to start both backend and frontend:

```bash
# Starts both backend and Expo
node start-dev.js
```

## Default Admin Credentials
- **Username:** admin
- **Password:** admin123

## Troubleshooting Steps

1. **Check if backend is running:**
   ```bash
   curl http://localhost:8081/api/health
   ```

2. **Check network connectivity:**
   ```bash
   node test-connection.js
   ```

3. **For mobile devices:**
   - Use your computer's IP address, not localhost
   - Ensure both devices are on the same network
   - Check firewall settings

4. **Alternative: Use Tunnel Mode**
   ```bash
   expo start --tunnel
   ```

## Common Issues

### Port 8081 Already in Use
```bash
# Kill process using port 8081
lsof -ti:8081 | xargs kill -9
```

### Firewall Blocking Connection
- Allow port 8081 through your firewall
- On macOS: System Preferences > Security & Privacy > Firewall
- On Windows: Windows Defender Firewall settings

### Network Interface Issues
- Restart your network adapter
- Try using a different network interface
- Use tunnel mode as a fallback

## Still Having Issues?

1. Check the console logs for more specific error messages
2. Ensure you're using the correct IP address for mobile development
3. Try restarting both the backend server and Expo development server
4. Use tunnel mode if local network setup is problematic