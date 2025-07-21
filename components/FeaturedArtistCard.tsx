import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { User } from '@/types/audio';
import { colors } from '@/constants/colors';
import { defaultAvatarUri } from '@/constants/images';
import { useUserStore } from '@/store/user-store';

interface FeaturedArtistCardProps {
  user: User;
  onPress?: () => void;
}

export default function FeaturedArtistCard({ user, onPress }: FeaturedArtistCardProps) {
  const router = useRouter();
  
  // Generate album cover images for each artist
  const getAlbumCover = (userId: string) => {
    const albumCovers = [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&h=400&fit=crop', // Vinyl records
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=400&h=400&fit=crop', // Music studio
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&h=400&fit=crop', // Synthesizer
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=400&h=400&fit=crop', // Audio mixing
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=400&h=400&fit=crop', // Piano keys
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=400&h=400&fit=crop', // Guitar
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&h=400&fit=crop', // Vinyl collection
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=400&h=400&fit=crop', // Recording studio
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&h=400&fit=crop', // Music equipment
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=400&h=400&fit=crop'  // Audio gear
    ];
    const index = parseInt(userId) % albumCovers.length;
    return albumCovers[index];
  };
  
  if (!user || !user.id) return null;
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/profile/${user.id}`);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: getAlbumCover(user.id) }} 
        style={styles.albumCover}
        defaultSource={{ uri: defaultAvatarUri }}
      />
      
      <View style={styles.overlay}>
        <Text style={styles.displayName} numberOfLines={1}>{user.displayName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginRight: 12,
    width: 140,
    height: 140,
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  albumCover: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  displayName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});