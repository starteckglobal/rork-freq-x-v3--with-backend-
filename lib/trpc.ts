import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Always prioritize environment variable if set
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // For development, use localhost
  if (process.env.NODE_ENV === 'development') {
    // Check if we're running on web or mobile
    if (typeof window !== 'undefined') {
      // Web - use localhost
      return 'http://localhost:8081';
    } else {
      // Mobile - fallback to localhost (user should set env var for mobile)
      return 'http://localhost:8081';
    }
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
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
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
          console.error('Network request failed:', error);
          console.error('Request URL:', url);
          console.error('Base URL:', getBaseUrl());
          
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection and try again.');
          }
          
          // Provide more specific error messages
          if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
            const baseUrl = getBaseUrl();
            throw new Error(`Network request failed: Network request failed. Please check if the server is running on ${baseUrl}.`);
          }
          
          throw error;
        }
      },
    }),
  ],
});