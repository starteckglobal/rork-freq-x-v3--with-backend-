import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft,
  AlertTriangle,
  Copyright,
  Flag,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
} from 'lucide-react-native';

export default function ReportsManagement() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'Open' | 'Investigating' | 'Resolved' | 'Dismissed'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: reportsData, refetch } = trpc.reports.list.useQuery({
    status: filterStatus === 'all' ? undefined : filterStatus,
    severity: filterSeverity === 'all' ? undefined : filterSeverity,
  });

  const updateStatusMutation = trpc.reports.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      setShowResolveModal(false);
      setSelectedReport(null);
      setResolutionNotes('');
      Alert.alert('Success', 'Report status updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleStatusUpdate = (reportId: string, newStatus: string, notes?: string) => {
    updateStatusMutation.mutate({
      reportId,
      status: newStatus as any,
      notes: notes || '',
    });
  };

  const handleResolve = () => {
    if (!selectedReport || !resolutionNotes.trim()) {
      Alert.alert('Error', 'Please provide resolution notes');
      return;
    }

    handleStatusUpdate(selectedReport.id, 'Resolved', resolutionNotes);
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'Copyright': return Copyright;
      case 'Inappropriate Content': return Flag;
      case 'Spam': return MessageSquare;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#EF4444';
      case 'Investigating': return '#F59E0B';
      case 'Resolved': return '#10B981';
      case 'Dismissed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return AlertTriangle;
      case 'Investigating': return Eye;
      case 'Resolved': return CheckCircle;
      case 'Dismissed': return XCircle;
      default: return Clock;
    }
  };

  const ReportCard = ({ report }: { report: any }) => {
    const TypeIcon = getReportTypeIcon(report.type);
    const StatusIcon = getStatusIcon(report.status);
    
    return (
      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.reportInfo}>
            <View style={styles.reportTitleRow}>
              <TypeIcon size={16} color="#8B5CF6" />
              <Text style={styles.reportType}>{report.type}</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(report.severity) + '20' }]}>
                <Text style={[styles.severityText, { color: getSeverityColor(report.severity) }]}>
                  {report.severity}
                </Text>
              </View>
            </View>
            <Text style={styles.reporterEmail}>From: {report.reporter_email}</Text>
            <Text style={styles.reportDate}>
              {new Date(report.created_at).toLocaleDateString()} at {new Date(report.created_at).toLocaleTimeString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
            <StatusIcon size={12} color={getStatusColor(report.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
              {report.status}
            </Text>
          </View>
        </View>

        <Text style={styles.reportDescription} numberOfLines={3}>
          {report.description}
        </Text>

        <View style={styles.reportMeta}>
          <Text style={styles.metaText}>Content ID: {report.reported_content_id}</Text>
          <Text style={styles.metaText}>User ID: {report.reported_user_id}</Text>
        </View>

        <View style={styles.reportActions}>
          {report.status === 'Open' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.investigateButton]}
              onPress={() => handleStatusUpdate(report.id, 'Investigating')}
            >
              <Eye size={16} color="#F59E0B" />
              <Text style={[styles.actionButtonText, { color: '#F59E0B' }]}>Investigate</Text>
            </TouchableOpacity>
          )}
          
          {(report.status === 'Open' || report.status === 'Investigating') && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.resolveButton]}
                onPress={() => {
                  setSelectedReport(report);
                  setShowResolveModal(true);
                }}
              >
                <CheckCircle size={16} color="#10B981" />
                <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Resolve</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.dismissButton]}
                onPress={() => {
                  Alert.alert(
                    'Dismiss Report',
                    'Are you sure you want to dismiss this report?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Dismiss',
                        style: 'destructive',
                        onPress: () => handleStatusUpdate(report.id, 'Dismissed', 'Report dismissed by admin'),
                      },
                    ]
                  );
                }}
              >
                <XCircle size={16} color="#6B7280" />
                <Text style={[styles.actionButtonText, { color: '#6B7280' }]}>Dismiss</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Moderation</Text>
        <Text style={styles.reportCount}>
          {reportsData?.reports.length || 0} reports
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {['all', 'Open', 'Investigating', 'Resolved', 'Dismissed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
              onPress={() => setFilterStatus(status as any)}
            >
              <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                {status === 'all' ? 'All Status' : status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {['all', 'High', 'Medium', 'Low'].map((severity) => (
            <TouchableOpacity
              key={severity}
              style={[styles.filterChip, filterSeverity === severity && styles.filterChipActive]}
              onPress={() => setFilterSeverity(severity as any)}
            >
              <Text style={[styles.filterChipText, filterSeverity === severity && styles.filterChipTextActive]}>
                {severity === 'all' ? 'All Severity' : severity}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reports List */}
      <ScrollView style={styles.reportsList}>
        {reportsData?.reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
        
        {reportsData?.reports.length === 0 && (
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color="#374151" />
            <Text style={styles.emptyTitle}>No Reports Found</Text>
            <Text style={styles.emptySubtitle}>
              No reports match your current filters
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Resolve Modal */}
      <Modal
        visible={showResolveModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowResolveModal(false);
              setSelectedReport(null);
              setResolutionNotes('');
            }}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Resolve Report</Text>
            <TouchableOpacity onPress={handleResolve}>
              <Text style={styles.modalResolveText}>Resolve</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalReportType}>
              {selectedReport?.type} Report
            </Text>
            <Text style={styles.modalReportDescription}>
              {selectedReport?.description}
            </Text>
            
            <Text style={styles.modalLabel}>Resolution Notes *</Text>
            <TextInput
              style={styles.modalTextArea}
              placeholder="Describe how this report was resolved..."
              placeholderTextColor="#9CA3AF"
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  reportCount: {
    fontSize: 14,
    color: '#EF4444',
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  filtersSection: {
    padding: 24,
    paddingBottom: 16,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  reportsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  reportCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reportType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reporterEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reportDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 12,
    lineHeight: 20,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  investigateButton: {
    backgroundColor: '#F59E0B20',
  },
  resolveButton: {
    backgroundColor: '#10B98120',
  },
  dismissButton: {
    backgroundColor: '#6B728020',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalResolveText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalReportType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalReportDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalTextArea: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
    height: 120,
    textAlignVertical: 'top',
  },
});