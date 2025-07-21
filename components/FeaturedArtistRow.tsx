import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, Animated, Dimensions } from 'react-native';
import FeaturedArtistCard from './FeaturedArtistCard';
import { User } from '@/types/audio';
import { colors } from '@/constants/colors';

interface FeaturedArtistRowProps {
  title: string;
  artists: User[];
}

const FeaturedArtistRow = React.memo(function FeaturedArtistRow({ title, artists }: FeaturedArtistRowProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  
  useEffect(() => {
    // Create glow animation similar to FREQY chat button
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );

    glowAnimation.start();

    return () => {
      glowAnimation.stop();
    };
  }, []);
  
  if (!artists || artists.length === 0) {
    return null;
  }
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.scrollContainer}>
        {/* Glow effect around scrollable section */}
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
            },
          ]}
          pointerEvents="none"
        />
        <ScrollView 
          style={styles.scrollView}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={Platform.OS === 'ios' ? 152 : undefined}
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
          canCancelContentTouches={false}
        >
          {artists.map((artist, index) => (
            <FeaturedArtistCard 
              key={`artist-${artist.id}-${index}`} 
              user={artist} 
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
});

export default FeaturedArtistRow;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    minHeight: 200,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  scrollContainer: {
    position: 'relative',
    height: 160,
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: -8,
    left: -16,
    right: -16,
    bottom: -8,
    height: 176,
    backgroundColor: '#2B4BF2',
    zIndex: 0,
  },
  scrollView: {
    height: 160,
    zIndex: 1,
  },
  scrollContent: {
    paddingRight: 16,
    paddingLeft: 16,
    alignItems: 'center',
    minHeight: 160,
    flexGrow: 1,
  },
});