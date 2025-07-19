import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Flag,
  Clock,
  Music,
  User,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ContentManagement() {
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  const { data: contentData, refetch } = trpc.content.pending.useQuery({
    priority: undefined,
    limit: 50,
  });

  const reviewMutation = trpc.content.review.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Content reviewed successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const batchActionMutation = trpc.content.batchAction.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedTracks([]);
      Alert.alert('Success', 'Batch action completed successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleReview = (trackId: string, action: 'approve' | 'reject', notes?: string) => {
    reviewMutation.mutate({
      trackId,
      action,
      notes: notes || '',
    });
  };

  const handleBatchAction = (action: 'approve' | 'reject') => {
    if (selectedTracks.length === 0) {
      Alert.alert('Error', 'Please select tracks first');
      return;
    }

    Alert.alert(
      'Confirm Batch Action',
      `Are you sure you want to ${action} ${selectedTracks.length} tracks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: action === 'reject' ? 'destructive' : 'default',
          onPress: () => {
            batchActionMutation.mutate({
              action,
              trackIds: selectedTracks,
              reason: `Batch ${action} by admin`,
            });
          },
        },
      ]
    );
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const TrackCard = ({ track }: { track: any }) => {
    const isSelected = selectedTracks.includes(track.id);
    
    return (
      <View style={[styles.trackCard, isSelected && styles.trackCardSelected]}>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => toggleTrackSelection(track.id)}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <CheckCircle size={16} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>

        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackArtist}>Artist ID: {track.artist_id}</Text>
          <View style={styles.trackMeta}>
            <View style={styles.metaItem}>
              <Music size={14} color="#06B6D4" />
              <Text style={styles.metaText}>{track.genre}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={14} color="#9CA3AF" />
              <Text style={styles.metaText}>{formatDuration(track.duration)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.uploadDate}>
                {new Date(track.uploaded_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.trackActions}>
          <TouchableOpacity style={styles.playButton}>
            <Play size={16} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleReview(track.id, 'approve')}
          >
            <CheckCircle size={16} color="#10B981" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => {
              Alert.alert(
                'Reject Track',
                'Please provide a reason for rejection:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Copyright Issue', onPress: () => handleReview(track.id, 'reject', 'Copyright violation') },
                  { text: 'Quality Issue', onPress: () => handleReview(track.id, 'reject', 'Audio quality below standards') },
                  { text: 'Inappropriate', onPress: () => handleReview(track.id, 'reject', 'Inappropriate content') },
                ]
              );
            }}
          >
            <XCircle size={16} color="#EF4444" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.flagButton]}>
            <Flag size={16} color="#F59E0B" />
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Content Review</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Batch Actions */}
      {selectedTracks.length > 0 && (
        <View style={styles.batchActions}>
          <Text style={styles.batchText}>
            {selectedTracks.length} selected
          </Text>
          <View style={styles.batchButtons}>
            <TouchableOpacity
              style={[styles.batchButton, styles.batchApprove]}
              onPress={() => handleBatchAction('approve')}
            >
              <CheckCircle size={16} color="#10B981" />
              <Text style={[styles.batchButtonText, { color: '#10B981' }]}>
                Approve All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.batchButton, styles.batchReject]}
              onPress={() => handleBatchAction('reject')}
            >
              <XCircle size={16} color="#EF4444" />
              <Text style={[styles.batchButtonText, { color: '#EF4444' }]}>
                Reject All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content List */}
      <ScrollView style={styles.contentList}>
        {contentData?.tracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
        
        {contentData?.tracks.length === 0 && (
          <View style={styles.emptyState}>
            <Music size={48} color="#374151" />
            <Text style={styles.emptyTitle}>No Pending Reviews</Text>
            <Text style={styles.emptySubtitle}>
              All content has been reviewed
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
  pendingCount: {
    fontSize: 14,
    color: '#F59E0B',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  batchButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  batchApprove: {
    backgroundColor: '#10B98120',
  },
  batchReject: {
    backgroundColor: '#EF444420',
  },
  batchButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  trackCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  trackCardSelected: {
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
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  uploadDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  trackActions: {
    flexDirection: 'row',
    gap: 8,
  },
  playButton: {
    backgroundColor: '#8B5CF6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10B98120',
  },
  rejectButton: {
    backgroundColor: '#EF444420',
  },
  flagButton: {
    backgroundColor: '#F59E0B20',
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