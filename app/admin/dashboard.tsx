import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  FileText,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Music,
  MessageSquare,
  Shield,
  TrendingUp,
  Home,
  ArrowLeft,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { freqLogoUrl } from '@/constants/images';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTracks: number;
  pendingReviews: number;
  openTickets: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, refetch: refetchStats } = trpc.analytics.overview.useQuery(
    { period: '30d' },
    { enabled: !!adminUser }
  );

  useEffect(() => {
    loadAdminUser();
  }, []);

  const loadAdminUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('admin_user');
      if (userData) {
        setAdminUser(JSON.parse(userData));
      } else {
        router.replace('/admin');
      }
    } catch (error) {
      router.replace('/admin');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('admin_token');
            await AsyncStorage.removeItem('admin_user');
            router.replace('/admin');
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value?.toLocaleString() || '0'}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const MenuButton = ({ title, subtitle, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!adminUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          Alert.alert(
            'Exit Admin Panel',
            'Are you sure you want to exit the admin panel?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', onPress: () => router.push('/(tabs)') }
            ]
          );
        }}
      >
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
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
            style={styles.freqLogoButton}
          >
            <View style={styles.freqLogo}>
              <Image 
                source={{ uri: freqLogoUrl }}
                style={styles.freqLogoImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.adminName}>{adminUser.username}</Text>
            <Text style={styles.roleText}>{adminUser.role.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats?.metrics?.totalUsers}
              icon={Users}
              color="#8B5CF6"
              onPress={() => router.push('/admin/users')}
            />
            <StatCard
              title="Active Users"
              value={stats?.metrics?.activeUsers}
              icon={TrendingUp}
              color="#10B981"
              onPress={() => router.push('/admin/users')}
            />
            <StatCard
              title="Total Tracks"
              value={stats?.metrics?.totalTracks}
              icon={Music}
              color="#06B6D4"
              onPress={() => router.push('/admin/content')}
            />
            <StatCard
              title="Pending Reviews"
              value={stats?.metrics?.pendingReviews}
              icon={FileText}
              color="#F59E0B"
              onPress={() => router.push('/admin/content')}
            />
            <StatCard
              title="Open Tickets"
              value={stats?.metrics?.openTickets}
              icon={MessageSquare}
              color="#EF4444"
              onPress={() => router.push('/admin/support')}
            />
            <StatCard
              title="Monthly Revenue"
              value={`${stats?.metrics?.monthlyRevenue?.toLocaleString() || '0'}`}
              icon={DollarSign}
              color="#8B5CF6"
              onPress={() => router.push('/admin/payments')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.menuGrid}>
            <MenuButton
              title="User Management"
              subtitle="Manage users, bans, warnings"
              icon={Users}
              color="#8B5CF6"
              onPress={() => router.push('/admin/users')}
            />
            <MenuButton
              title="Content Review"
              subtitle="Review pending uploads"
              icon={FileText}
              color="#06B6D4"
              onPress={() => router.push('/admin/content')}
            />
            <MenuButton
              title="Reports & Moderation"
              subtitle="Handle user reports"
              icon={AlertTriangle}
              color="#EF4444"
              onPress={() => router.push('/admin/reports')}
            />
            <MenuButton
              title="Payment Management"
              subtitle="Process payments, disputes"
              icon={DollarSign}
              color="#10B981"
              onPress={() => router.push('/admin/payments')}
            />
            <MenuButton
              title="Sync Opportunities"
              subtitle="Manage sync lab listings"
              icon={Music}
              color="#F59E0B"
              onPress={() => router.push('/admin/sync')}
            />
            <MenuButton
              title="Analytics"
              subtitle="Platform insights & reports"
              icon={BarChart3}
              color="#8B5CF6"
              onPress={() => router.push('/admin/analytics')}
            />
            <MenuButton
              title="Support Tickets"
              subtitle="Customer support queue"
              icon={MessageSquare}
              color="#06B6D4"
              onPress={() => router.push('/admin/support')}
            />
            <MenuButton
              title="System Settings"
              subtitle="Platform configuration"
              icon={Settings}
              color="#6B7280"
              onPress={() => router.push('/admin/system')}
            />
          </View>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  freqLogoButton: {
    padding: 4,
  },
  freqLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  freqLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  freqLogoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  adminName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  menuGrid: {
    gap: 12,
  },
  menuButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
});