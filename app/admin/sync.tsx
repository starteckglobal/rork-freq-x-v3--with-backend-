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
  Plus,
  Edit,
  Calendar,
  DollarSign,
  Music,
  Building,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react-native';

export default function SyncManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSync, setEditingSync] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    budget_range: '',
    genre_preferences: '',
    deadline: '',
    requirements: '',
    contact_info: '',
  });

  const { data: syncData, refetch } = trpc.sync.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const createMutation = trpc.sync.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreateModal(false);
      resetForm();
      Alert.alert('Success', 'Sync opportunity created successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const updateMutation = trpc.sync.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingSync(null);
      resetForm();
      Alert.alert('Success', 'Sync opportunity updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      brand: '',
      budget_range: '',
      genre_preferences: '',
      deadline: '',
      requirements: '',
      contact_info: '',
    });
  };

  const handleCreate = () => {
    if (!formData.title.trim() || !formData.brand.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    createMutation.mutate({
      ...formData,
      genre_preferences: formData.genre_preferences.split(',').map(g => g.trim()).filter(Boolean),
    });
  };

  const handleUpdate = () => {
    if (!editingSync || !formData.title.trim() || !formData.brand.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    updateMutation.mutate({
      id: editingSync.id,
      ...formData,
      genre_preferences: formData.genre_preferences.split(',').map(g => g.trim()).filter(Boolean),
    });
  };

  const handleEdit = (sync: any) => {
    setEditingSync(sync);
    setFormData({
      title: sync.title,
      description: sync.description,
      brand: sync.brand,
      budget_range: sync.budget_range,
      genre_preferences: sync.genre_preferences.join(', '),
      deadline: sync.deadline.toISOString().split('T')[0],
      requirements: sync.requirements,
      contact_info: sync.contact_info,
    });
    setShowCreateModal(true);
  };

  const handleStatusChange = (sync: any, newStatus: string) => {
    updateMutation.mutate({
      id: sync.id,
      status: newStatus as any,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'closed': return '#6B7280';
      case 'draft': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'closed': return XCircle;
      case 'draft': return Clock;
      default: return Clock;
    }
  };

  const SyncCard = ({ sync }: { sync: any }) => {
    const StatusIcon = getStatusIcon(sync.status);
    const isExpired = new Date(sync.deadline) < new Date();
    
    return (
      <View style={styles.syncCard}>
        <View style={styles.syncHeader}>
          <View style={styles.syncInfo}>
            <Text style={styles.syncTitle}>{sync.title}</Text>
            <Text style={styles.syncBrand}>{sync.brand}</Text>
            <View style={styles.syncMeta}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sync.status) + '20' }]}>
                <StatusIcon size={12} color={getStatusColor(sync.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(sync.status) }]}>
                  {sync.status.toUpperCase()}
                </Text>
              </View>
              {isExpired && (
                <View style={styles.expiredBadge}>
                  <Text style={styles.expiredText}>EXPIRED</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(sync)}
          >
            <Edit size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        <Text style={styles.syncDescription} numberOfLines={2}>
          {sync.description}
        </Text>

        <View style={styles.syncDetails}>
          <View style={styles.detailItem}>
            <DollarSign size={16} color="#10B981" />
            <Text style={styles.detailText}>{sync.budget_range}</Text>
          </View>
          <View style={styles.detailItem}>
            <Calendar size={16} color="#F59E0B" />
            <Text style={styles.detailText}>
              {new Date(sync.deadline).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Music size={16} color="#06B6D4" />
            <Text style={styles.detailText}>
              {sync.genre_preferences.slice(0, 2).join(', ')}
              {sync.genre_preferences.length > 2 && ` +${sync.genre_preferences.length - 2}`}
            </Text>
          </View>
        </View>

        <View style={styles.syncActions}>
          {sync.status === 'draft' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.activateButton]}
              onPress={() => handleStatusChange(sync, 'active')}
            >
              <CheckCircle size={16} color="#10B981" />
              <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Activate</Text>
            </TouchableOpacity>
          )}
          {sync.status === 'active' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.closeButton]}
              onPress={() => handleStatusChange(sync, 'closed')}
            >
              <XCircle size={16} color="#EF4444" />
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Close</Text>
            </TouchableOpacity>
          )}
          {sync.status === 'closed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.reactivateButton]}
              onPress={() => handleStatusChange(sync, 'active')}
            >
              <CheckCircle size={16} color="#8B5CF6" />
              <Text style={[styles.actionButtonText, { color: '#8B5CF6' }]}>Reactivate</Text>
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
        <Text style={styles.headerTitle}>Sync Opportunities</Text>
        <View style={styles.headerRight}>
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
            <Text style={styles.freqLogoText}>FREQ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setEditingSync(null);
              setShowCreateModal(true);
            }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync List */}
      <ScrollView style={styles.syncList}>
        {syncData?.opportunities.map((sync) => (
          <SyncCard key={sync.id} sync={sync} />
        ))}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowCreateModal(false);
              setEditingSync(null);
              resetForm();
            }}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingSync ? 'Edit Sync' : 'Create Sync'}
            </Text>
            <TouchableOpacity onPress={editingSync ? handleUpdate : handleCreate}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalContentContainer}
          >
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Nike Commercial Campaign"
                placeholderTextColor="#9CA3AF"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Brand *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Nike"
                placeholderTextColor="#9CA3AF"
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Describe the sync opportunity..."
                placeholderTextColor="#9CA3AF"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Budget Range</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., $5,000 - $15,000"
                placeholderTextColor="#9CA3AF"
                value={formData.budget_range}
                onChangeText={(text) => setFormData({ ...formData, budget_range: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Genre Preferences</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Electronic, Hip-Hop, Pop"
                placeholderTextColor="#9CA3AF"
                value={formData.genre_preferences}
                onChangeText={(text) => setFormData({ ...formData, genre_preferences: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Deadline</Text>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={formData.deadline}
                onChangeText={(text) => setFormData({ ...formData, deadline: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Requirements</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Specific requirements for submissions..."
                placeholderTextColor="#9CA3AF"
                value={formData.requirements}
                onChangeText={(text) => setFormData({ ...formData, requirements: text })}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Contact Info</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., sync@brand.com"
                placeholderTextColor="#9CA3AF"
                value={formData.contact_info}
                onChangeText={(text) => setFormData({ ...formData, contact_info: text })}
              />
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  freqLogoButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  freqLogoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  syncCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  syncBrand: {
    fontSize: 14,
    color: '#06B6D4',
    marginTop: 2,
  },
  syncMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
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
  expiredBadge: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  expiredText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
  },
  syncDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    lineHeight: 20,
  },
  syncDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  syncActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
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
  activateButton: {
    backgroundColor: '#10B98120',
  },
  closeButton: {
    backgroundColor: '#EF444420',
  },
  reactivateButton: {
    backgroundColor: '#8B5CF620',
  },
  actionButtonText: {
    fontSize: 12,
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
  modalSaveText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
    minHeight: 48,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});