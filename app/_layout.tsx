import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import '@/lib/firebase';
import { firebaseUtils } from '@/lib/firebase-utils';
import { EqualizerProvider } from '@/app/settings/equalizer';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce background refetch on Android for better performance
      staleTime: Platform.OS === 'android' ? 5 * 60 * 1000 : 0, // 5 minutes on Android
      gcTime: Platform.OS === 'android' ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10 minutes on Android
    },
  },
});

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    if (typeof window !== 'undefined') {
      return 'http://localhost:8081';
    } else {
      return 'http://localhost:8081';
    }
  }

  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  return 'http://localhost:8081';
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ],
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // Remove SpaceMono font loading since it's not available
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // Initialize Firebase authentication in development
      if (__DEV__) {
        firebaseUtils.testConnection().then((result) => {
          if (result.success) {
            console.log('✅ Firebase initialized successfully:', result.message);
          } else {
            console.error('❌ Firebase initialization failed:', result.error);
            if (result.suggestions) {
              console.log('💡 Suggestions:');
              result.suggestions.forEach((suggestion, index) => {
                console.log(`   ${index + 1}. ${suggestion}`);
              });
            }
          }
        }).catch((error) => {
          console.error('❌ Firebase test error:', error);
        });
      }
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <EqualizerProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </EqualizerProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}