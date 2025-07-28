import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Play, Heart, Clock, Calendar } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { BSideTrack } from '@/store/bsides-store';

interface BSidesTrackListProps {
  tracks: BSideTrack[];
  onTrackPress: (track: BSideTrack) => void;
  onLikePress: (trackId: string) => void;
}

export default function BSidesTrackList({ tracks, onTrackPress, onLikePress }: BSidesTrackListProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPlays = (plays: number) => {
    if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}K`;
    }
    return plays.toString();
  };

  if (tracks.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateTitle}>No B-sides yet</Text>
        <Text style={styles.emptyStateText}>
          Upload your first exclusive track to get started
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {tracks.map((track, index) => (
        <TouchableOpacity
          key={track.id}
          style={[styles.trackItem, index === tracks.length - 1 && styles.lastTrackItem]}
          onPress={() => onTrackPress(track)}
          activeOpacity={0.7}
        >
          <View style={styles.trackContent}>
            <View style={styles.trackHeader}>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.trackDescription} numberOfLines={2}>
                  {track.description}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => onTrackPress(track)}
              >
                <Play size={16} color={colors.text} fill={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.trackMeta}>
              <View style={styles.metaItem}>
                <Calendar size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{formatDate(track.uploadedAt)}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Clock size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{formatDuration(track.duration)}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>{formatPlays(track.plays)} plays</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.likeButton}
                onPress={() => onLikePress(track.id)}
              >
                <Heart size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{track.likes}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  trackItem: {
    backgroundColor: colors.card,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  lastTrackItem: {
    marginBottom: 0,
  },
  trackContent: {
    flex: 1,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  playButton: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyStateTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});