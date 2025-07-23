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
      // Web
      return 'http://localhost:8081';
    } else {
      // Mobile - use your computer's IP address
      // You may need to replace this with your actual IP address for mobile testing
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

// Function to test server connectivity
export const testServerConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for connection test
    
    console.log(`🔍 Testing server connection to: ${getBaseUrl()}/health`);
    
    const response = await fetch(`${getBaseUrl()}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const isConnected = response.ok;
    console.log(`🔗 Server connection test: ${isConnected ? '✅ Connected' : '❌ Failed'}`);
    
    if (isConnected) {
      const data = await response.json();
      console.log(`📊 Server status:`, data);
    }
    
    return isConnected;
  } catch (error) {
    console.log('❌ Server connection test failed:', error);
    return false;
  }
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
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const response = await fetch(url.toString(), {
            ...options,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          return response;
        } catch (error: unknown) {
          console.error('❌ Network request failed:', error);
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              throw new Error('Request timeout. Please check your connection and try again.');
            }
            throw new Error(`Network request failed: ${error.message}. Please ensure the backend server is running on port 8081.`);
          }
          throw new Error('Network request failed. Please ensure the backend server is running on port 8081.');
        }
      },
    }),
  ],
});