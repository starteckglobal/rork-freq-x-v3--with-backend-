import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Music,
  DollarSign,
  Download,
  Calendar,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Analytics() {
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const { data: overviewData } = trpc.analytics.overview.useQuery({
    period: timePeriod,
  });

  const { data: usersData } = trpc.analytics.users.useQuery({
    period: timePeriod,
    metric: 'growth',
  });

  const MetricCard = ({ title, value, change, icon: Icon, color }: any) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.metricChange}>
          {change > 0 ? (
            <TrendingUp size={16} color="#10B981" />
          ) : (
            <TrendingDown size={16} color="#EF4444" />
          )}
          <Text style={[styles.changeText, { color: change > 0 ? '#10B981' : '#EF4444' }]}>
            {Math.abs(change)}%
          </Text>
        </View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );

  const ChartPlaceholder = ({ title, height = 200 }: { title: string; height?: number }) => (
    <View style={[styles.chartContainer, { height }]}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartPlaceholderText}>Chart visualization would go here</Text>
        <Text style={styles.chartPlaceholderSubtext}>
          In production, integrate with charting library like Victory or Recharts
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Time Period Selector */}
      <View style={styles.periodSelector}>
        {['7d', '30d', '90d', '1y'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, timePeriod === period && styles.periodButtonActive]}
            onPress={() => setTimePeriod(period as any)}
          >
            <Text style={[styles.periodButtonText, timePeriod === period && styles.periodButtonTextActive]}>
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '1 Year'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Total Users"
              value={overviewData?.totalUsers?.toLocaleString() || '0'}
              change={12.5}
              icon={Users}
              color="#8B5CF6"
            />
            <MetricCard
              title="Active Users"
              value={overviewData?.activeUsers?.toLocaleString() || '0'}
              change={8.3}
              icon={TrendingUp}
              color="#10B981"
            />
            <MetricCard
              title="Total Tracks"
              value={overviewData?.totalTracks?.toLocaleString() || '0'}
              change={15.7}
              icon={Music}
              color="#06B6D4"
            />
            <MetricCard
              title="Monthly Revenue"
              value={`$${overviewData?.monthlyRevenue?.toLocaleString() || '0'}`}
              change={22.1}
              icon={DollarSign}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* User Growth Chart */}
        <View style={styles.section}>
          <ChartPlaceholder title="User Growth Over Time" height={250} />
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <ChartPlaceholder title="Revenue Trends" height={250} />
        </View>

        {/* Content Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{overviewData?.pendingReviews || 0}</Text>
              <Text style={styles.statLabel}>Pending Reviews</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1,234</Text>
              <Text style={styles.statLabel}>Approved This Month</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>56</Text>
              <Text style={styles.statLabel}>Rejected This Month</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>98.2%</Text>
              <Text style={styles.statLabel}>Approval Rate</Text>
            </View>
          </View>
        </View>

        {/* Top Genres Chart */}
        <View style={styles.section}>
          <ChartPlaceholder title="Top Genres" height={200} />
        </View>

        {/* User Engagement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Engagement</Text>
          <View style={styles.engagementStats}>
            <View style={styles.engagementItem}>
              <Text style={styles.engagementValue}>4.2</Text>
              <Text style={styles.engagementLabel}>Avg. Session Duration (min)</Text>
            </View>
            <View style={styles.engagementItem}>
              <Text style={styles.engagementValue}>12.5</Text>
              <Text style={styles.engagementLabel}>Avg. Tracks per Session</Text>
            </View>
            <View style={styles.engagementItem}>
              <Text style={styles.engagementValue}>68%</Text>
              <Text style={styles.engagementLabel}>Daily Active Users</Text>
            </View>
          </View>
        </View>

        {/* Platform Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Health</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <View style={[styles.healthIndicator, { backgroundColor: '#10B981' }]} />
              <Text style={styles.healthLabel}>System Uptime</Text>
              <Text style={styles.healthValue}>99.9%</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={[styles.healthIndicator, { backgroundColor: '#10B981' }]} />
              <Text style={styles.healthLabel}>API Response Time</Text>
              <Text style={styles.healthValue}>120ms</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={[styles.healthIndicator, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.healthLabel}>Error Rate</Text>
              <Text style={styles.healthValue}>0.1%</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={[styles.healthIndicator, { backgroundColor: '#10B981' }]} />
              <Text style={styles.healthLabel}>Storage Usage</Text>
              <Text style={styles.healthValue}>67%</Text>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exportButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  periodButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    borderWidth: 1,
    borderColor: '#374151',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    width: (width - 72) / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  engagementStats: {
    gap: 12,
  },
  engagementItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  engagementValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  engagementLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  healthItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    borderWidth: 1,
    borderColor: '#374151',
  },
  healthIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  healthLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});