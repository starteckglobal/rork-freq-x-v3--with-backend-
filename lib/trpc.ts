import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // For development, use localhost
  if (process.env.NODE_ENV === 'development') {
    // Check if we're running on web or mobile
    if (typeof window !== 'undefined') {
      // Web - use localhost
      return 'http://localhost:8081';
    } else {
      // Mobile - need to use the tunnel URL or computer's IP
      // When using expo start --tunnel, the backend should be accessible via tunnel
      // For now, try to use the tunnel URL if available
      if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
        return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
      }
      // Fallback to localhost for mobile (this might not work on physical devices)
      return 'http://localhost:8081';
    }
  }

  // For production, use the environment variable
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Fallback for development
  return 'http://localhost:8081';
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: async () => {
        const token = await AsyncStorage.getItem('admin_token');
        return {
          'Content-Type': 'application/json',
          ...(token && { authorization: `Bearer ${token}` }),
        };
      },
      fetch: async (url, options) => {
        try {
          console.log('Making request to:', url);
          console.log('Base URL:', getBaseUrl());
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          console.log('Response status:', response.status);
          return response;
        } catch (error: any) {
          console.error('Network request failed:', error);
          console.error('Request URL:', url);
          console.error('Base URL:', getBaseUrl());
          
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection and try again.');
          }
          
          // Provide more specific error messages
          if (error.message.includes('Network request failed')) {
            throw new Error(`Cannot connect to server. Please ensure:\n1. Backend server is running (run: bun run server.ts)\n2. Server is accessible at ${getBaseUrl()}\n3. For mobile devices, use tunnel mode (expo start --tunnel)`);
          }
          
          throw new Error(`Network request failed: ${error.message}`);
        }
      },
    }),
  ],
});