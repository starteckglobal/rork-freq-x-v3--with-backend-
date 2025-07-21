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
  
  // Generate random photos from Unsplash for each artist
  const getRandomPhoto = (userId: string) => {
    const photoIds = ['1527004', '415829', '598745', '1674752', '1858175', '2379004', '2613260', '3785077', '4099235', '4553618'];
    const randomId = photoIds[parseInt(userId) % photoIds.length];
    return `https://picsum.photos/id/${randomId}/300/300`;
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
        source={{ uri: getRandomPhoto(user.id) }} 
        style={styles.photo}
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
    width: 160,
    height: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  photo: {
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