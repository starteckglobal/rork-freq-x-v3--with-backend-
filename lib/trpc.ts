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
    }),
  ],
});