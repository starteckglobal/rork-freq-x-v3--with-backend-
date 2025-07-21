import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { X, Shield } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdminLoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ visible, onClose }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const loginMutation = trpc.auth.login.useMutation();

  const testConnectivity = async (baseUrl: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      // First test basic connectivity
      const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:8081';
      console.log('Testing connectivity to:', baseUrl);
      
      const isConnected = await testConnectivity(baseUrl);
      if (!isConnected) {
        throw new Error('Cannot connect to backend server. Please ensure the server is running.');
      }
      
      const result = await loginMutation.mutateAsync({
        username: username.trim(),
        password: password.trim(),
      });

      // Store the token
      await AsyncStorage.setItem('admin_token', result.token);
      
      setLoading(false);
      onClose();
      setUsername('');
      setPassword('');
      router.push('/admin');
    } catch (error: any) {
      setLoading(false);
      console.error('ERROR Login attempt failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Login failed';
      let troubleshootingTips = '';
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed') || error.message?.includes('Cannot connect to backend')) {
        errorMessage = 'Cannot connect to server';
        troubleshootingTips = '\n\n🔧 Quick Fix:\n• Run: node network-fix-complete.js\n• Or manually: bun run server.ts\n\n📱 For mobile:\n• Update .env.local with your IP\n• Backend should be on: http://YOUR_IP:8081';
      } else if (error.message?.includes('UNAUTHORIZED') || error.message?.includes('Invalid credentials')) {
        errorMessage = 'Invalid credentials';
        troubleshootingTips = '\n\n🔑 Default login:\nUsername: admin\nPassword: admin123';
      } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
        errorMessage = 'Connection timeout';
        troubleshootingTips = '\n\n⏰ Server may be slow to respond:\n• Check backend logs\n• Restart: bun run server.ts\n• Run: node network-fix-complete.js';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
        troubleshootingTips = '\n\n🔍 Debug steps:\n• Run: node network-fix-complete.js\n• Check backend logs\n• Verify .env.local settings';
      }
      
      Alert.alert('Login Error', errorMessage + troubleshootingTips);
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Shield size={24} color={colors.primary} />
            <Text style={styles.title}>Admin Access</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Enter your administrator credentials to access the FREQ Moderator Dashboard
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ This dashboard provides administrative access to user accounts, content moderation, and system controls.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  warning: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  warningText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});