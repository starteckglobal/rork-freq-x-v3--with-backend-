# FREQ Backend Server Setup

## Quick Start

### 1. Start the Backend Server
```bash
# Option 1: Using the startup script
chmod +x start-server.sh
./start-server.sh

# Option 2: Direct command
bun run server.ts
```

### 2. Verify Server is Running
```bash
# Test connection
curl http://localhost:8081/health

# Check if port is in use
lsof -i :8081
```

### 3. Admin Login Credentials
- **Username:** `masterfreq`
- **Password:** `freq2007`

## Server Endpoints

| Endpoint | Description |
|----------|-------------|
| `http://localhost:8081/health` | Server health check |
| `http://localhost:8081/api/health` | API health check |
| `http://localhost:8081/api/trpc` | tRPC API endpoint |

## Troubleshooting

### Port 8081 Already in Use
```bash
# Find process using port 8081
lsof -i :8081

# Kill process using port 8081
lsof -ti :8081 | xargs kill -9
```

### Authentication Issues
1. **Verify server is running:** Check `http://localhost:8081/health`
2. **Check credentials:** Use `masterfreq` / `freq2007`
3. **Clear app storage:** The app will fall back to offline mode if backend fails

### Connection Errors
- Ensure server is running on port 8081
- Check firewall settings
- Verify CORS configuration includes your client origin

## Development Notes

- The app works in **offline mode** if backend is unavailable
- Authentication falls back to local validation when server is down
- All admin features work offline with mock data
- Server logs all requests with timing information

## Server Configuration

- **Port:** 8081 (configured in `server.ts`)
- **CORS:** Allows localhost origins for development
- **Authentication:** JWT tokens with 24h expiration
- **Database:** Mock data (in production, connect to real database)