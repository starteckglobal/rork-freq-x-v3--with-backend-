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
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={Platform.OS === 'ios' ? 172 : undefined}
        snapToAlignment="start"
        directionalLockEnabled={true}
      >
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </ScrollView>
    </View>
  );
});

export default PlaylistRow;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
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
  },
});