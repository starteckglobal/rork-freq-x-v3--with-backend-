import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import FeaturedArtistCard from './FeaturedArtistCard';
import { User } from '@/types/audio';
import { colors } from '@/constants/colors';

interface FeaturedArtistRowProps {
  title: string;
  artists: User[];
}

const FeaturedArtistRow = React.memo(function FeaturedArtistRow({ title, artists }: FeaturedArtistRowProps) {
  if (!artists || artists.length === 0) {
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
        bounces={Platform.OS === 'ios'}
        overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        persistentScrollbar={false}
        pagingEnabled={false}
        alwaysBounceHorizontal={Platform.OS === 'ios'}
        scrollEnabled={true}
        canCancelContentTouches={true}
      >
        {artists.map((artist, index) => (
          <FeaturedArtistCard 
            key={`artist-${artist.id}-${index}`} 
            user={artist} 
          />
        ))}
      </ScrollView>
    </View>
  );
});

export default FeaturedArtistRow;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    minHeight: 220,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
    paddingLeft: 4,
    minHeight: 180,
  },
});