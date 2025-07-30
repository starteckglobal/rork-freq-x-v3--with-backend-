import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft,
  Search,
  Filter,
  Ban,
  MessageSquare,
  Download,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Artist' | 'Producer' | 'Listener'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Suspended' | 'Banned'>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');

  const { data: usersData, refetch } = trpc.users.list.useQuery({
    filter: filterType === 'all' ? undefined : filterType,
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: searchQuery || undefined,
    limit: 50,
    offset: 0,
  });

  const updateStatusMutation = trpc.users.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'User status updated successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const sendMessageMutation = trpc.users.sendMessage.useMutation({
    onSuccess: () => {
      setShowMessageModal(false);
      setMessage('');
      setMessageSubject('');
      setSelectedUser(null);
      Alert.alert('Success', 'Message sent successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleStatusChange = (user: any, newStatus: string) => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${newStatus.toLowerCase()} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            updateStatusMutation.mutate({
              userId: user.id,
              status: newStatus as any,
              reason: `Status changed to ${newStatus} by admin`,
            });
          },
        },
      ]
    );
  };

  const handleSendMessage = () => {
    if (!messageSubject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message');
      return;
    }

    sendMessageMutation.mutate({
      userId: selectedUser.id,
      subject: messageSubject,
      message,
      priority: 'medium',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10B981';
      case 'Suspended': return '#F59E0B';
      case 'Banned': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return CheckCircle;
      case 'Suspended': return AlertTriangle;
      case 'Banned': return XCircle;
      default: return User;
    }
  };

  const UserCard = ({ user }: { user: any }) => {
    const StatusIcon = getStatusIcon(user.status);
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userMeta}>
              <Text style={styles.userType}>{user.type}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) + '20' }]}>
                <StatusIcon size={12} color={getStatusColor(user.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(user.status) }]}>
                  {user.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.track_count}</Text>
            <Text style={styles.statLabel}>Tracks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.warning_count}</Text>
            <Text style={styles.statLabel}>Warnings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date(user.joined_date).toLocaleDateString()}
            </Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedUser(user);
              setShowMessageModal(true);
            }}
          >
            <MessageSquare size={16} color="#06B6D4" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>

          {user.status === 'Active' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.suspendButton]}
              onPress={() => handleStatusChange(user, 'Suspended')}
            >
              <AlertTriangle size={16} color="#F59E0B" />
              <Text style={[styles.actionButtonText, { color: '#F59E0B' }]}>Suspend</Text>
            </TouchableOpacity>
          )}

          {user.status !== 'Banned' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.banButton]}
              onPress={() => handleStatusChange(user, 'Banned')}
            >
              <Ban size={16} color="#EF4444" />
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Ban</Text>
            </TouchableOpacity>
          )}

          {user.status !== 'Active' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.activateButton]}
              onPress={() => handleStatusChange(user, 'Active')}
            >
              <CheckCircle size={16} color="#10B981" />
              <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Activate</Text>
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
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)')}
          style={styles.freqLogoButton}
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
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')} 
              style={styles.clearSearchButton}
            >
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {['all', 'Artist', 'Producer', 'Listener'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, filterType === type && styles.filterChipActive]}
              onPress={() => setFilterType(type as any)}
            >
              <Text style={[styles.filterChipText, filterType === type && styles.filterChipTextActive]}>
                {type === 'all' ? 'All Types' : type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {['all', 'Active', 'Suspended', 'Banned'].map((status) => (
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
      </View>

      {/* Users List */}
      <ScrollView style={styles.usersList}>
        {usersData?.users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </ScrollView>

      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMessageModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Send Message</Text>
            <TouchableOpacity onPress={handleSendMessage}>
              <Text style={styles.modalSendText}>Send</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalUserName}>To: {selectedUser?.name}</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Subject"
              placeholderTextColor="#9CA3AF"
              value={messageSubject}
              onChangeText={setMessageSubject}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Message"
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
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
  freqLogoButton: {
    padding: 4,
  },
  freqLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqLogoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  searchSection: {
    padding: 24,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
    paddingRight: 40,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  usersList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  userCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  userType: {
    fontSize: 12,
    color: '#06B6D4',
    backgroundColor: '#06B6D420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#374151',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  userActions: {
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
  suspendButton: {
    backgroundColor: '#F59E0B20',
  },
  banButton: {
    backgroundColor: '#EF444420',
  },
  activateButton: {
    backgroundColor: '#10B98120',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#06B6D4',
    fontWeight: '500',
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
  modalSendText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalUserName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});