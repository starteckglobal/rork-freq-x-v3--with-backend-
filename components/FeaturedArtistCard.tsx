import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { UserRound, Plus, Check } from 'lucide-react-native';
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
  const { isFollowing, followUser, unfollowUser } = useUserStore();
  const [following, setFollowing] = useState(false);
  
  useEffect(() => {
    if (user && user.id) {
      setFollowing(isFollowing(user.id));
    }
  }, [user, isFollowing]);
  
  if (!user || !user.id) return null;
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/profile/${user.id}`);
    }
  };
  
  const handleFollow = (e: any) => {
    e.stopPropagation();
    if (following) {
      unfollowUser(user.id);
      setFollowing(false);
    } else {
      followUser(user.id);
      setFollowing(true);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {user.avatarUrl ? (
        <Image 
          source={{ uri: user.avatarUrl || defaultAvatarUri }} 
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <UserRound size={32} color={colors.textSecondary} />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.displayName} numberOfLines={1}>{user.displayName}</Text>
        <Text style={styles.username} numberOfLines={1}>@{user.username}</Text>
        <Text style={styles.stats}>{user.tracksCount || 0} tracks</Text>
        
        <TouchableOpacity 
          style={[styles.followButton, following && styles.followingButton]}
          onPress={handleFollow}
        >
          {following ? (
            <>
              <Check size={16} color={colors.text} />
              <Text style={styles.followText}>Following</Text>
            </>
          ) : (
            <>
              <Plus size={16} color={colors.text} />
              <Text style={styles.followText}>Follow</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 160,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cardElevated,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  displayName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  stats: {
    color: colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  followButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: colors.cardElevated,
  },
  followText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
});