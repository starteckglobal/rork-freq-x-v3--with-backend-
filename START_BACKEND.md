# Backend Server Startup Guide

## Quick Start

To fix the login error, you need to start the backend server:

```bash
# Start the backend server
bun run server.ts
```

The server should start on port 8081 and you should see:
```
Starting server on port 8081...
Server is running on http://localhost:8081
```

## Testing the Backend

After starting the server, you can test it:

```bash
# Test basic connectivity
node test-backend.js
```

## Troubleshooting

### Error: "Failed to fetch" or "Network request failed"
- **Cause**: Backend server is not running
- **Solution**: Run `bun run server.ts` in a separate terminal

### Error: "UNAUTHORIZED" or "Invalid credentials"
- **Cause**: Wrong username/password
- **Solution**: Use credentials: `masterfreq` / `freq2007`

### Error: "EADDRINUSE" (Port already in use)
- **Cause**: Another process is using port 8081
- **Solution**: Kill the process or change the port in `server.ts`

## Development Workflow

1. **Terminal 1**: Start backend server
   ```bash
   bun run server.ts
   ```

2. **Terminal 2**: Start Expo app
   ```bash
   expo start --tunnel
   ```

## Admin Login Credentials

- **Username**: `masterfreq`
- **Password**: `freq2007`

## API Endpoints

- Health Check: `http://localhost:8081/api`
- TRPC Endpoint: `http://localhost:8081/api/trpc`
- Login: `POST http://localhost:8081/api/trpc/auth.login`