import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  Server,
  Database,
  Shield,
  Mail,
  Bell,
  Globe,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Save,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';

interface SystemSettings {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  upload_enabled: boolean;
  max_file_size: number;
  email_notifications: boolean;
  backup_enabled: boolean;
  auto_moderation: boolean;
  rate_limiting: boolean;
  cdn_enabled: boolean;
  analytics_enabled: boolean;
}

export default function SystemSettingsScreen() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    registration_enabled: true,
    upload_enabled: true,
    max_file_size: 100,
    email_notifications: true,
    backup_enabled: true,
    auto_moderation: true,
    rate_limiting: true,
    cdn_enabled: true,
    analytics_enabled: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastSaved(new Date());
      Alert.alert('Success', 'System settings have been saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save system settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              maintenance_mode: false,
              registration_enabled: true,
              upload_enabled: true,
              max_file_size: 100,
              email_notifications: true,
              backup_enabled: true,
              auto_moderation: true,
              rate_limiting: true,
              cdn_enabled: true,
              analytics_enabled: true,
            });
            Alert.alert('Success', 'Settings have been reset to defaults');
          }
        }
      ]
    );
  };

  const clearCache = () => {
    Alert.alert(
      'Clear System Cache',
      'This will clear all cached data and may temporarily slow down the system. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          onPress: async () => {
            // Simulate cache clearing
            await new Promise(resolve => setTimeout(resolve, 2000));
            Alert.alert('Success', 'System cache has been cleared');
          }
        }
      ]
    );
  };

  const runBackup = () => {
    Alert.alert(
      'Manual Backup',
      'This will create a full system backup. This process may take several minutes. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Backup',
          onPress: async () => {
            Alert.alert('Backup Started', 'The backup process has been initiated. You will be notified when it completes.');
          }
        }
      ]
    );
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const ToggleSetting = ({ 
    icon: Icon, 
    title, 
    description, 
    value, 
    onValueChange, 
    disabled = false 
  }: {
    icon: any;
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Icon size={20} color="#8B5CF6" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#374151', true: '#8B5CF6' }}
        thumbColor="#FFFFFF"
        disabled={disabled}
      />
    </View>
  );

  const ActionButton = ({ 
    icon: Icon, 
    title, 
    description, 
    onPress, 
    color = '#8B5CF6',
    destructive = false 
  }: {
    icon: any;
    title: string;
    description: string;
    onPress: () => void;
    color?: string;
    destructive?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.actionButton, destructive && styles.destructiveButton]}
      onPress={onPress}
    >
      <Icon size={20} color={destructive ? '#EF4444' : color} />
      <View style={styles.actionText}>
        <Text style={[styles.actionTitle, destructive && styles.destructiveText]}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        title: 'System Settings',
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' },
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.headerButton}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                'Return to FREQ',
                'Are you sure you want to return to the main app?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Yes', onPress: () => router.push('/(tabs)') }
                ]
              );
            }}
            style={styles.headerButton}
          >
            <LinearGradient
              colors={['#8B5CF6', '#06B6D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.freqLogo}
            >
              <Text style={styles.freqLogoText}>FREQ</Text>
            </LinearGradient>
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView style={styles.scrollView}>
        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={saveSettings}
            disabled={isSaving}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Text>
          </TouchableOpacity>
          
          {lastSaved && (
            <View style={styles.lastSavedContainer}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.lastSavedText}>
                Last saved: {lastSaved.toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>

        {/* Platform Settings */}
        <SettingSection title="Platform Settings">
          <ToggleSetting
            icon={AlertTriangle}
            title="Maintenance Mode"
            description="Temporarily disable the platform for maintenance"
            value={settings.maintenance_mode}
            onValueChange={(value) => updateSetting('maintenance_mode', value)}
          />
          
          <ToggleSetting
            icon={Globe}
            title="User Registration"
            description="Allow new users to register accounts"
            value={settings.registration_enabled}
            onValueChange={(value) => updateSetting('registration_enabled', value)}
          />
          
          <ToggleSetting
            icon={Upload}
            title="Track Uploads"
            description="Allow users to upload new tracks"
            value={settings.upload_enabled}
            onValueChange={(value) => updateSetting('upload_enabled', value)}
          />
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Upload size={20} color="#8B5CF6" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Max File Size (MB)</Text>
                <Text style={styles.settingDescription}>Maximum upload file size</Text>
              </View>
            </View>
            <TextInput
              style={styles.numberInput}
              value={settings.max_file_size.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                updateSetting('max_file_size', num);
              }}
              keyboardType="numeric"
              placeholder="100"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </SettingSection>

        {/* Security & Moderation */}
        <SettingSection title="Security & Moderation">
          <ToggleSetting
            icon={Shield}
            title="Auto Moderation"
            description="Automatically moderate content using AI"
            value={settings.auto_moderation}
            onValueChange={(value) => updateSetting('auto_moderation', value)}
          />
          
          <ToggleSetting
            icon={Shield}
            title="Rate Limiting"
            description="Limit API requests to prevent abuse"
            value={settings.rate_limiting}
            onValueChange={(value) => updateSetting('rate_limiting', value)}
          />
        </SettingSection>

        {/* Communications */}
        <SettingSection title="Communications">
          <ToggleSetting
            icon={Mail}
            title="Email Notifications"
            description="Send system emails to users"
            value={settings.email_notifications}
            onValueChange={(value) => updateSetting('email_notifications', value)}
          />
          
          <ToggleSetting
            icon={Bell}
            title="Push Notifications"
            description="Send push notifications to mobile apps"
            value={settings.analytics_enabled}
            onValueChange={(value) => updateSetting('analytics_enabled', value)}
          />
        </SettingSection>

        {/* Performance */}
        <SettingSection title="Performance">
          <ToggleSetting
            icon={Globe}
            title="CDN Enabled"
            description="Use content delivery network for faster loading"
            value={settings.cdn_enabled}
            onValueChange={(value) => updateSetting('cdn_enabled', value)}
          />
          
          <ToggleSetting
            icon={Database}
            title="Analytics Collection"
            description="Collect usage analytics for insights"
            value={settings.analytics_enabled}
            onValueChange={(value) => updateSetting('analytics_enabled', value)}
          />
        </SettingSection>

        {/* Backup & Recovery */}
        <SettingSection title="Backup & Recovery">
          <ToggleSetting
            icon={Database}
            title="Automatic Backups"
            description="Automatically backup system data daily"
            value={settings.backup_enabled}
            onValueChange={(value) => updateSetting('backup_enabled', value)}
          />
        </SettingSection>

        {/* System Actions */}
        <SettingSection title="System Actions">
          <ActionButton
            icon={Database}
            title="Run Manual Backup"
            description="Create a full system backup now"
            onPress={runBackup}
          />
          
          <ActionButton
            icon={RefreshCw}
            title="Clear System Cache"
            description="Clear all cached data to free up space"
            onPress={clearCache}
          />
          
          <ActionButton
            icon={RefreshCw}
            title="Reset to Defaults"
            description="Reset all settings to their default values"
            onPress={resetToDefaults}
            destructive
          />
        </SettingSection>

        {/* System Information */}
        <SettingSection title="System Information">
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Platform Version</Text>
            <Text style={styles.infoValue}>v2.1.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Database Version</Text>
            <Text style={styles.infoValue}>PostgreSQL 14.2</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Server Uptime</Text>
            <Text style={styles.infoValue}>15 days, 8 hours</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Storage Used</Text>
            <Text style={styles.infoValue}>2.4 TB / 5.0 TB</Text>
          </View>
        </SettingSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerButton: {
    padding: 8,
  },
  freqLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  saveSection: {
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lastSavedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  lastSavedText: {
    color: '#10B981',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1F2937',
  },
  sectionContent: {
    backgroundColor: '#111827',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  numberInput: {
    backgroundColor: '#374151',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 16,
    minWidth: 80,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    gap: 12,
  },
  destructiveButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  destructiveText: {
    color: '#EF4444',
  },
  actionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  infoLabel: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});