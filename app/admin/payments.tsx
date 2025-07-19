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
import {
  ArrowLeft,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
} from 'lucide-react-native';

// Mock payment data - in production this would come from tRPC
const mockPayments = [
  {
    id: '1',
    artist_id: '1',
    artist_name: 'John Producer',
    amount: 150.00,
    currency: 'USD',
    status: 'completed',
    payment_method: 'stripe',
    transaction_id: 'txn_123',
    processed_at: new Date('2024-02-28'),
    created_at: new Date('2024-02-25'),
  },
  {
    id: '2',
    artist_id: '2',
    artist_name: 'Sarah Artist',
    amount: 75.50,
    currency: 'USD',
    status: 'pending',
    payment_method: 'paypal',
    transaction_id: 'txn_456',
    created_at: new Date('2024-03-01'),
  },
  {
    id: '3',
    artist_id: '3',
    artist_name: 'Mike Producer',
    amount: 200.00,
    currency: 'USD',
    status: 'failed',
    payment_method: 'stripe',
    transaction_id: 'txn_789',
    failure_reason: 'Insufficient funds',
    created_at: new Date('2024-03-02'),
  },
  {
    id: '4',
    artist_id: '4',
    artist_name: 'Lisa Artist',
    amount: 320.75,
    currency: 'USD',
    status: 'disputed',
    payment_method: 'stripe',
    transaction_id: 'txn_101',
    created_at: new Date('2024-02-20'),
  },
];

export default function PaymentManagement() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'disputed'>('all');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingNotes, setProcessingNotes] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'disputed': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return XCircle;
      case 'disputed': return AlertTriangle;
      default: return Clock;
    }
  };

  const handleProcessPayments = () => {
    if (selectedPayments.length === 0) {
      Alert.alert('Error', 'Please select payments to process');
      return;
    }

    Alert.alert(
      'Process Payments',
      `Process ${selectedPayments.length} selected payments?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Process',
          onPress: () => {
            // In production, call tRPC mutation
            console.log('Processing payments:', selectedPayments);
            setSelectedPayments([]);
            Alert.alert('Success', 'Payments processed successfully');
          },
        },
      ]
    );
  };

  const handleRetryPayment = (paymentId: string) => {
    Alert.alert(
      'Retry Payment',
      'Attempt to retry this failed payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: () => {
            // In production, call tRPC mutation
            console.log('Retrying payment:', paymentId);
            Alert.alert('Success', 'Payment retry initiated');
          },
        },
      ]
    );
  };

  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const filteredPayments = mockPayments.filter(payment => 
    filterStatus === 'all' || payment.status === filterStatus
  );

  const PaymentCard = ({ payment }: { payment: any }) => {
    const StatusIcon = getStatusIcon(payment.status);
    const isSelected = selectedPayments.includes(payment.id);
    
    return (
      <View style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => togglePaymentSelection(payment.id)}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <CheckCircle size={16} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>

        <View style={styles.paymentInfo}>
          <View style={styles.paymentHeader}>
            <Text style={styles.artistName}>{payment.artist_name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
              <StatusIcon size={12} color={getStatusColor(payment.status)} />
              <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                {payment.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.paymentDetails}>
            <View style={styles.amountRow}>
              <DollarSign size={16} color="#10B981" />
              <Text style={styles.amount}>
                {payment.amount.toFixed(2)} {payment.currency}
              </Text>
            </View>
            <Text style={styles.paymentMethod}>via {payment.payment_method}</Text>
            <Text style={styles.transactionId}>ID: {payment.transaction_id}</Text>
          </View>

          <View style={styles.paymentMeta}>
            <Text style={styles.createdDate}>
              Created: {payment.created_at.toLocaleDateString()}
            </Text>
            {payment.processed_at && (
              <Text style={styles.processedDate}>
                Processed: {payment.processed_at.toLocaleDateString()}
              </Text>
            )}
            {payment.failure_reason && (
              <Text style={styles.failureReason}>
                Reason: {payment.failure_reason}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.paymentActions}>
          {payment.status === 'failed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.retryButton]}
              onPress={() => handleRetryPayment(payment.id)}
            >
              <RefreshCw size={16} color="#8B5CF6" />
            </TouchableOpacity>
          )}
          
          {payment.status === 'disputed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.resolveButton]}
              onPress={() => {
                Alert.alert('Resolve Dispute', 'Feature coming soon');
              }}
            >
              <CheckCircle size={16} color="#10B981" />
            </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Payment Management</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {['all', 'pending', 'completed', 'failed', 'disputed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
              onPress={() => setFilterStatus(status as any)}
            >
              <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Batch Actions */}
      {selectedPayments.length > 0 && (
        <View style={styles.batchActions}>
          <Text style={styles.batchText}>
            {selectedPayments.length} selected
          </Text>
          <TouchableOpacity
            style={styles.processButton}
            onPress={handleProcessPayments}
          >
            <CheckCircle size={16} color="#FFFFFF" />
            <Text style={styles.processButtonText}>Process Selected</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Summary Stats */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            ${filteredPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
          </Text>
          <Text style={styles.summaryLabel}>Total Amount</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{filteredPayments.length}</Text>
          <Text style={styles.summaryLabel}>Total Payments</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {filteredPayments.filter(p => p.status === 'pending').length}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>

      {/* Payments List */}
      <ScrollView style={styles.paymentsList}>
        {filteredPayments.map((payment) => (
          <PaymentCard key={payment.id} payment={payment} />
        ))}
        
        {filteredPayments.length === 0 && (
          <View style={styles.emptyState}>
            <DollarSign size={48} color="#374151" />
            <Text style={styles.emptyTitle}>No Payments Found</Text>
            <Text style={styles.emptySubtitle}>
              No payments match your current filters
            </Text>
          </View>
        )}
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
  batchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  batchText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  processButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  paymentsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  paymentCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  paymentCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF610',
  },
  selectionButton: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  paymentInfo: {
    flex: 1,
    marginRight: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  paymentDetails: {
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  transactionId: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentMeta: {
    gap: 2,
  },
  createdDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  processedDate: {
    fontSize: 12,
    color: '#10B981',
  },
  failureReason: {
    fontSize: 12,
    color: '#EF4444',
  },
  paymentActions: {
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#8B5CF620',
  },
  resolveButton: {
    backgroundColor: '#10B98120',
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
});