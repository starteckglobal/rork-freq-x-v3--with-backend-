import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  Heart,
  MoreVertical,
  Filter
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BSideTrack } from '@/store/bsides-store';

interface BSidesManagementProps {
  tracks: BSideTrack[];
  onAddTrack: () => void;
  onEditTrack: (track: BSideTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  onPlayTrack: (track: BSideTrack) => void;
  onToggleVisibility: (trackId: string) => void;
}

type SortOption = 'date' | 'title' | 'plays' | 'likes';
type FilterOption = 'all' | 'public' | 'private';

export default function BSidesManagement({ 
  tracks, 
  onAddTrack, 
  onEditTrack, 
  onDeleteTrack, 
  onPlayTrack,
  onToggleVisibility 
}: BSidesManagementProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState<boolean>(false);
  const { colors: themeColors } = useColorScheme();
  const styles = createStyles(themeColors);

  const filteredAndSortedTracks = useMemo(() => {
    let filtered = tracks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(track => 
        track.title.toLowerCase().includes(query) ||
        track.description.toLowerCase().includes(query)
      );
    }

    // Apply visibility filter (mock implementation)
    if (filterBy !== 'all') {
      // In a real app, tracks would have a visibility property
      // For now, we'll mock it based on track ID
      filtered = filtered.filter(track => {
        const isPublic = parseInt(track.id.slice(-1)) % 2 === 0;
        return filterBy === 'public' ? isPublic : !isPublic;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'plays':
          return b.plays - a.plays;
        case 'likes':
          return b.likes - a.likes;
        case 'date':
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

    return filtered;
  }, [tracks, searchQuery, sortBy, filterBy]);

  const handleTrackSelect = (trackId: string) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
    } else {
      newSelected.add(trackId);
    }
    setSelectedTracks(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedTracks.size === filteredAndSortedTracks.length) {
      setSelectedTracks(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedTracks(new Set(filteredAndSortedTracks.map(track => track.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Selected Tracks',
      `Are you sure you want to delete ${selectedTracks.size} track(s)? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedTracks.forEach(trackId => onDeleteTrack(trackId));
            setSelectedTracks(new Set());
            setShowBulkActions(false);
          }
        }
      ]
    );
  };

  const handleBulkVisibilityToggle = () => {
    selectedTracks.forEach(trackId => onToggleVisibility(trackId));
    setSelectedTracks(new Set());
    setShowBulkActions(false);
  };

  const handleDeleteTrack = (track: BSideTrack) => {
    Alert.alert(
      'Delete Track',
      `Are you sure you want to delete "${track.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteTrack(track.id)
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPlays = (plays: number) => {
    if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}K`;
    }
    return plays.toString();
  };

  const isTrackPublic = (trackId: string) => {
    // Mock implementation - in real app, this would be a track property
    return parseInt(trackId.slice(-1)) % 2 === 0;
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage B-sides</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddTrack}>
          <Plus size={20} color={themeColors.text} />
          <Text style={styles.addButtonText}>Add Song</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.controlsSection}>
        <View style={styles.searchContainer}>
          <Search size={16} color={themeColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your B-sides..."
            placeholderTextColor={themeColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort by:</Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                const options: SortOption[] = ['date', 'title', 'plays', 'likes'];
                const labels = ['Date', 'Title', 'Plays', 'Likes'];
                Alert.alert(
                  'Sort by',
                  'Choose sorting option',
                  options.map((option, index) => ({
                    text: labels[index],
                    onPress: () => setSortBy(option)
                  }))
                );
              }}
            >
              <Text style={styles.filterButtonText}>
                {sortBy === 'date' ? 'Date' : 
                 sortBy === 'title' ? 'Title' : 
                 sortBy === 'plays' ? 'Plays' : 'Likes'}
              </Text>
              <Filter size={14} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Show:</Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                const options: FilterOption[] = ['all', 'public', 'private'];
                const labels = ['All', 'Public', 'Private'];
                Alert.alert(
                  'Filter by visibility',
                  'Choose visibility filter',
                  options.map((option, index) => ({
                    text: labels[index],
                    onPress: () => setFilterBy(option)
                  }))
                );
              }}
            >
              <Text style={styles.filterButtonText}>
                {filterBy === 'all' ? 'All' : 
                 filterBy === 'public' ? 'Public' : 'Private'}
              </Text>
              <Filter size={14} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bulk Actions */}
      {showBulkActions && (
        <View style={styles.bulkActionsBar}>
          <Text style={styles.bulkActionsText}>
            {selectedTracks.size} selected
          </Text>
          <View style={styles.bulkActionsButtons}>
            <TouchableOpacity 
              style={styles.bulkActionButton}
              onPress={handleBulkVisibilityToggle}
            >
              <EyeOff size={16} color={themeColors.text} />
              <Text style={styles.bulkActionText}>Toggle</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkActionButton, styles.bulkDeleteButton]}
              onPress={handleBulkDelete}
            >
              <Trash2 size={16} color="#FF4444" />
              <Text style={[styles.bulkActionText, styles.bulkDeleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Select All Button */}
      {filteredAndSortedTracks.length > 0 && (
        <TouchableOpacity style={styles.selectAllButton} onPress={handleSelectAll}>
          <Text style={styles.selectAllText}>
            {selectedTracks.size === filteredAndSortedTracks.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Tracks List */}
      <ScrollView style={styles.tracksList} showsVerticalScrollIndicator={false}>
        {filteredAndSortedTracks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No tracks found' : 'No B-sides yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Upload your first exclusive track to get started'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity style={styles.emptyStateButton} onPress={onAddTrack}>
                <Plus size={16} color={themeColors.text} />
                <Text style={styles.emptyStateButtonText}>Add Your First B-side</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredAndSortedTracks.map((track, index) => (
            <View 
              key={track.id} 
              style={[
                styles.trackItem,
                selectedTracks.has(track.id) && styles.trackItemSelected,
                index === filteredAndSortedTracks.length - 1 && styles.lastTrackItem
              ]}
            >
              {/* Selection Checkbox */}
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => handleTrackSelect(track.id)}
              >
                <View style={[
                  styles.checkboxInner,
                  selectedTracks.has(track.id) && styles.checkboxSelected
                ]}>
                  {selectedTracks.has(track.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Track Content */}
              <View style={styles.trackContent}>
                <View style={styles.trackHeader}>
                  <View style={styles.trackInfo}>
                    <View style={styles.trackTitleRow}>
                      <Text style={styles.trackTitle} numberOfLines={1}>
                        {track.title}
                      </Text>
                      <View style={styles.visibilityIndicator}>
                        {isTrackPublic(track.id) ? (
                          <Eye size={12} color={themeColors.primary} />
                        ) : (
                          <EyeOff size={12} color={themeColors.textSecondary} />
                        )}
                      </View>
                    </View>
                    <Text style={styles.trackDescription} numberOfLines={1}>
                      {track.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.trackMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={12} color={themeColors.textSecondary} />
                    <Text style={styles.metaText}>{formatDate(track.uploadedAt)}</Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <Clock size={12} color={themeColors.textSecondary} />
                    <Text style={styles.metaText}>{formatDuration(track.duration)}</Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText}>{formatPlays(track.plays)} plays</Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <Heart size={12} color={themeColors.textSecondary} />
                    <Text style={styles.metaText}>{track.likes}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.trackActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => onPlayTrack(track)}
                >
                  <Play size={16} color={themeColors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => onEditTrack(track)}
                >
                  <Edit size={16} color={themeColors.text} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => onToggleVisibility(track.id)}
                >
                  {isTrackPublic(track.id) ? (
                    <EyeOff size={16} color={themeColors.textSecondary} />
                  ) : (
                    <Eye size={16} color={themeColors.textSecondary} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteTrack(track)}
                >
                  <Trash2 size={16} color="#FF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: themeColors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: themeColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  controlsSection: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: themeColors.text,
    fontSize: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    color: themeColors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColors.cardElevated,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  filterButtonText: {
    color: themeColors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  bulkActionsText: {
    color: themeColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  bulkActionsButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.cardElevated,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  bulkDeleteButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  bulkActionText: {
    color: themeColors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  bulkDeleteText: {
    color: '#FF4444',
  },
  selectAllButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  selectAllText: {
    color: themeColors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  tracksList: {
    flex: 1,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  trackItemSelected: {
    backgroundColor: themeColors.cardElevated,
    borderWidth: 1,
    borderColor: themeColors.primary,
  },
  lastTrackItem: {
    marginBottom: 0,
  },
  checkbox: {
    padding: 4,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: themeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  checkmark: {
    color: themeColors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  trackContent: {
    flex: 1,
  },
  trackHeader: {
    marginBottom: 8,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  trackTitle: {
    color: themeColors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  visibilityIndicator: {
    padding: 2,
  },
  trackDescription: {
    color: themeColors.textSecondary,
    fontSize: 14,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: themeColors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  trackActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: themeColors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: themeColors.card,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyStateTitle: {
    color: themeColors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    color: themeColors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  emptyStateButtonText: {
    color: themeColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});