import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import PlaylistCard from './PlaylistCard';
import { Playlist } from '@/types/audio';
import { colors } from '@/constants/colors';

interface PlaylistRowProps {
  title: string;
  playlists: Playlist[];
}

const PlaylistRow = React.memo(function PlaylistRow({ title, playlists }: PlaylistRowProps) {
  if (!playlists || playlists.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={Platform.OS === 'ios' ? 172 : undefined}
        snapToAlignment="start"
        directionalLockEnabled={true}
        bounces={Platform.OS === 'ios'}
        overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        persistentScrollbar={false}
        pagingEnabled={false}
        alwaysBounceHorizontal={Platform.OS === 'ios'}
        scrollEnabled={true}
      >
        {playlists.map((playlist, index) => (
          <PlaylistCard 
            key={`playlist-${playlist.id}-${index}`} 
            playlist={playlist} 
          />
        ))}
      </ScrollView>
    </View>
  );
});

export default PlaylistRow;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    minHeight: 220, // Ensure consistent height
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
    paddingLeft: 4,
    minHeight: 180, // Ensure scroll content has minimum height
  },
});