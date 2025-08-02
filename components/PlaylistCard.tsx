import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Playlist } from '@/types/audio';
import { colors } from '@/constants/colors';
import { defaultCoverArt } from '@/constants/images';

const { width: screenWidth } = Dimensions.get('window');

interface PlaylistCardProps {
  playlist: Playlist;
  onPress?: () => void;
  containerStyle?: any;
}

const PlaylistCard = React.memo(function PlaylistCard({ playlist, onPress, containerStyle }: PlaylistCardProps) {
  const router = useRouter();
  
  if (!playlist || !playlist.id) return null;
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/playlist/${playlist.id}`);
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: playlist.coverArt || defaultCoverArt }} 
          style={styles.coverArt}
        />
        <View style={styles.playButton}>
          <Play size={20} color={colors.text} fill={colors.text} />
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{playlist.name}</Text>
        <Text style={styles.creator} numberOfLines={1}>By You</Text>
        <Text style={styles.trackCount}>{playlist.tracks?.length || 0} tracks</Text>
      </View>
    </TouchableOpacity>
  );
});

export default PlaylistCard;

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    flexShrink: 0,
    width: 148,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: colors.cardElevated,
  },
  coverArt: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 4,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  creator: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  trackCount: {
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: 2,
  },
});