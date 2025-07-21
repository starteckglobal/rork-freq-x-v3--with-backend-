# Backend Setup Instructions

## Starting the Backend Server

The SyncLab app requires a backend server to handle payment processing and other API calls.

### Option 1: Start Backend Manually
```bash
# Start the backend server
bun run server.ts
```

### Option 2: Use the Start Script
```bash
# Start the backend server using the helper script
node start-backend.js
```

### Option 3: Start Both Frontend and Backend Together
```bash
# Install concurrently if not already installed
bun install concurrently

# Start both frontend and backend
bun run dev
```

## Troubleshooting

### Network Request Failed Error
If you see "Network request failed" errors in the signup/payment flow:

1. **Check if backend is running**: Make sure the backend server is running on port 8081
2. **Check console logs**: Look for "Server is running on http://localhost:8081" message
3. **Firewall issues**: Make sure port 8081 is not blocked by your firewall
4. **Mobile testing**: If testing on a physical device, you may need to:
   - Replace `localhost` with your computer's IP address in `lib/trpc.ts`
   - Make sure your device and computer are on the same network

### Demo Mode
If the backend is not available, the app will automatically fall back to demo mode for the signup/payment flow. You'll see a message indicating "Demo mode - backend not connected".

## Backend Features

The backend provides:
- Payment processing simulation (tRPC endpoints)
- User authentication
- Admin panel APIs
- Analytics and reporting
- Content management

## Development Notes

- Backend runs on port 8081 by default
- Frontend expects backend at `http://localhost:8081/api/trpc`
- CORS is configured for development with localhost origins
- All payment processing is simulated for demo purposes