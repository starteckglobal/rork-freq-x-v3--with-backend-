import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc, testServerConnection } from '@/lib/trpc';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, User, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { freqLogoUrl } from '@/constants/images';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      try {
        await AsyncStorage.setItem('admin_token', data.token);
        await AsyncStorage.setItem('admin_user', JSON.stringify(data.user));
        
        setIsLoading(false);
        Alert.alert('Success', 'Welcome to FREQ Moderator Dashboard', [
          { text: 'Continue', onPress: () => router.replace('/admin/dashboard') }
        ]);
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Error', 'Failed to save login data. Please try again.');
        console.error('Storage error:', error);
      }
    },
    onError: (error) => {
      setIsLoading(false);
      
      // Handle different types of errors
      let errorMessage = 'Invalid credentials. Please check your username and password.';
      
      console.error('🚨 Login attempt failed:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please ensure the backend server is running on port 8081 and try again.\n\nTo start server: bun run start:server';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.data?.code === 'UNAUTHORIZED') {
        errorMessage = 'Invalid credentials. Please check your username and password.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    }
  });

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    // First check if credentials match the fallback (offline mode)
    if (username.trim() === 'masterfreq' && password === 'freq2007') {
      // Test server connectivity
      const serverAvailable = await testServerConnection();
      
      if (serverAvailable) {
        try {
          console.log('🔐 Attempting backend authentication...');
          // Use tRPC backend for authentication
          await loginMutation.mutateAsync({
            username: username.trim(),
            password: password
          });
          return; // Exit early if backend login succeeds
        } catch (error) {
          console.error('🚨 Backend login failed, falling back to offline mode:', error);
          // Continue to fallback authentication below
        }
      } else {
        console.log('⚠️ Backend server not available, using offline mode');
      }
      
      // Fallback authentication (offline mode)
      try {
        console.log('Using fallback authentication (offline mode)...');
        
        // Create a mock token and user data
        const mockToken = 'fallback_token_' + Date.now();
        const mockUser = {
          id: 'admin',
          username: 'masterfreq',
          role: 'admin',
          name: 'FREQ Administrator'
        };
        
        await AsyncStorage.setItem('admin_token', mockToken);
        await AsyncStorage.setItem('admin_user', JSON.stringify(mockUser));
        
        setIsLoading(false);
        Alert.alert('Success', 'Welcome to FREQ Moderator Dashboard (Offline Mode)\n\nNote: Backend server is not running. Some features may be limited.', [
          { text: 'Continue', onPress: () => router.replace('/admin/dashboard') }
        ]);
      } catch (storageError) {
        setIsLoading(false);
        Alert.alert('Error', 'Failed to save login data. Please try again.');
        console.error('Storage error:', storageError);
      }
    } else {
      // Invalid credentials
      setIsLoading(false);
      Alert.alert('Access Denied', 'Invalid credentials. Please check your username and password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: freqLogoUrl }}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Moderator Dashboard</Text>
            <Text style={styles.subtitle}>Admin Access Required</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#8B5CF6', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginGradient}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>FREQ Music Platform</Text>
            <Text style={styles.footerSubtext}>Authorized Personnel Only</Text>
            <Text style={styles.serverInfo}>
              Backend Server: {typeof window !== 'undefined' ? 'http://localhost:8081' : 'http://localhost:8081'}
            </Text>
            <Text style={styles.serverNote}>
              Start backend: "bun run start:server" • Test: "bun run test:connection"
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#1F2937',
    borderWidth: 2,
    borderColor: '#374151',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  form: {
    marginBottom: 48,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#FFFFFF',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#4B5563',
  },
  serverInfo: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  serverNote: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});