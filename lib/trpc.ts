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
        console.log('Making request to:', url);
        console.log('Base URL:', baseUrl);
        
        // First, test basic connectivity
        try {
          const healthCheck = await fetch(`${baseUrl}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000),
          });
          
          if (!healthCheck.ok) {
            throw new Error(`Backend server returned ${healthCheck.status}`);
          }
        } catch (healthError: any) {
          console.error('Health check failed:', healthError.message);
          throw new Error('Cannot connect to backend server. Please ensure the server is running.');
        }
        
        // Retry logic for network requests
        const maxRetries = 2;
        let lastError: any;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            if (attempt > 0) {
              console.log(`Retry attempt ${attempt}/${maxRetries}`);
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
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
              // Don't retry on 4xx errors (client errors)
              if (response.status >= 400 && response.status < 500) {
                return response;
              }
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
          } catch (error: any) {
            lastError = error;
            console.error(`Attempt ${attempt + 1} failed:`, error.message);
            
            if (error.name === 'AbortError') {
              console.error('Request timed out');
            }
            
            // Don't retry on the last attempt
            if (attempt === maxRetries) {
              break;
            }
          }
        }
        
        // All retries failed
        console.error('ERROR All network attempts failed:', lastError);
        console.error('Request URL:', url);
        console.error('Base URL:', baseUrl);
        
        if (lastError.name === 'AbortError') {
          throw new Error('Request timed out. Please check your connection and try again.');
        }
        
        // Provide more specific error messages with troubleshooting
        if (lastError.message.includes('Network request failed') || lastError.message.includes('Failed to fetch') || lastError.message.includes('fetch')) {
          throw new Error(`Cannot connect to backend server. Please ensure the server is running.`);
        }
        
        throw new Error(`Cannot connect to backend server. Please ensure the server is running.`);
      },
    }),
  ],
});