import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Always prioritize environment variable if set
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using env base URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
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
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
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
          console.log('Making request to:', url);
          const baseUrl = getBaseUrl();
          console.log('Base URL:', baseUrl);
          
          // Quick health check first
          const isHealthy = await checkServerHealth(baseUrl);
          if (!isHealthy) {
            console.warn('Server health check failed');
          }
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const response = await fetch(url.toString(), {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            console.error('HTTP error:', response.status, response.statusText);
          }
          
          return response;
        } catch (error: any) {
          console.error('ERROR Network request failed:', error);
          console.error('Request URL:', url);
          const baseUrl = getBaseUrl();
          console.error('Base URL:', baseUrl);
          
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection and try again.');
          }
          
          // Provide more specific error messages with troubleshooting
          if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
            throw new Error(`Network request failed: Failed to fetch. Please check if the server is running on ${baseUrl}.`);
          }
          
          throw error;
        }
      },
    }),
  ],
});