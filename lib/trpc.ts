import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Always prioritize environment variable if set
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
    console.log('Using env base URL:', url);
    return url;
  }

  // For development, use localhost
  if (process.env.NODE_ENV === 'development') {
    // Check if we're running on web or mobile
    if (typeof window !== 'undefined') {
      // Web - use localhost
      console.log('Using localhost for web development');
      return 'http://localhost:8081';
    } else {
      // Mobile - fallback to localhost (user should set env var for mobile)
      console.log('Using localhost for mobile development (consider setting EXPO_PUBLIC_RORK_API_BASE_URL)');
      return 'http://localhost:8081';
    }
  }

  // Fallback for development
  console.log('Using fallback localhost URL');
  return 'http://localhost:8081';
};

// Create a health check function
const checkServerHealth = async (baseUrl: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('Health check failed:', error);
    return false;
  }
};

// Simple connection test function
const testConnection = async (baseUrl: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
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
        const baseUrl = getBaseUrl();
        console.log('Making TRPC request to:', url);
        
        // Quick connection test first
        const isConnected = await testConnection(baseUrl);
        if (!isConnected) {
          console.error('Backend server is not responding');
          throw new Error('Cannot connect to backend server. Please ensure the server is running.');
        }
        
        // Make the actual request with timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
          
          const response = await fetch(url.toString(), {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            console.error('TRPC HTTP error:', response.status, response.statusText);
          }
          
          return response;
        } catch (error: any) {
          console.error('TRPC request failed:', error.message);
          
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection and try again.');
          }
          
          throw new Error('Cannot connect to backend server. Please ensure the server is running.');
        }
      },
    }),
  ],
});