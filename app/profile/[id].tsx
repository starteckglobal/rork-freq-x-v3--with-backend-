import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  Image, 
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  Platform
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Share2, 
  MoreHorizontal, 
  Plus,
  Users,
  UserCheck,
  MessageCircle
} from 'lucide-react-native';
import TrackList from '@/components/TrackList';
import MiniPlayer from '@/components/MiniPlayer';
import { tracks } from '@/mocks/tracks';
import { users } from '@/mocks/users';
import { colors } from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { defaultAvatarUri } from '@/constants/images';
import FollowersModal from '@/components/FollowersModal';
import { useUserStore } from '@/store/user-store';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentTrack, isMinimized } = usePlayerStore();
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const { followUser, unfollowUser, isFollowing: checkIsFollowing } = useUserStore();
  const [isFollowing, setIsFollowing] = useState(false);
  
  const userId = id ? String(id) : '';
  const user = users.find(u => u.id === userId);
  
  // Check if following this user
  useEffect(() => {
    if (userId) {
      setIsFollowing(checkIsFollowing(userId));
    }
  }, [userId, checkIsFollowing]);
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'User not found',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Filter tracks by this artist
  const userTracks = tracks.filter(track => track.artistId === user.id);
  
  const toggleFollow = () => {
    if (!userId) return;
    
    if (isFollowing) {
      unfollowUser(userId);
      setIsFollowing(false);
    } else {
      followUser(userId);
      setIsFollowing(true);
    }
  };
  
  const handleMessage = () => {
    // Find or create a conversation with this user
    // For now, we'll use a simple conversation ID based on user ID
    const conversationId = `conv-${user.id}`;
    router.push(`/messages/${conversationId}`);
  };
  
  const handleShare = async () => {
    try {
      const profileUrl = `https://freq.app/profile/${user.id}`;
      const shareMessage = `Check out ${user.displayName} (@${user.username}) on FREQ! ${user.bio ? user.bio + ' ' : ''}${profileUrl}`;
      
      // Enhanced sharing with better error handling
      if (Platform.OS === 'web') {
        // Web sharing options
        Alert.alert(
          'Share Profile',
          'Choose how to share this profile:',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Copy Link', 
              onPress: async () => {
                // Enhanced web clipboard handling
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  try {
                    await navigator.clipboard.writeText(profileUrl);
                    Alert.alert('Success', 'Profile link copied to clipboard!');
                  } catch (clipboardError) {
                    // Fallback for clipboard issues
                    Alert.alert('Profile Link', `Copy this link: ${profileUrl}`);
                  }
                } else {
                  // Fallback for browsers without clipboard API
                  Alert.alert('Profile Link', `Copy this link: ${profileUrl}`);
                }
              }
            },
            { 
              text: 'Share on Social Media', 
              onPress: () => {
                Alert.alert(
                  'Share on Social Media',
                  'Choose platform:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Twitter/X', 
                      onPress: () => {
                        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
                        if (Platform.OS === 'web') {
                          try {
                            window.open(twitterUrl, '_blank');
                          } catch (error) {
                            Alert.alert('Error', 'Unable to open Twitter. Please copy the link manually.');
                          }
                        } else {
                          Alert.alert('Twitter Share', `Would open: ${twitterUrl}`);
                        }
                      }
                    },
                    { 
                      text: 'Facebook', 
                      onPress: () => {
                        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
                        if (Platform.OS === 'web') {
                          try {
                            window.open(facebookUrl, '_blank');
                          } catch (error) {
                            Alert.alert('Error', 'Unable to open Facebook. Please copy the link manually.');
                          }
                        } else {
                          Alert.alert('Facebook Share', `Would open: ${facebookUrl}`);
                        }
                      }
                    },
                    { 
                      text: 'Instagram', 
                      onPress: () => {
                        Alert.alert('Instagram Share', 'Instagram sharing requires the mobile app. Copy the link and share it in your Instagram story or post!');
                      }
                    },
                    { 
                      text: 'TikTok', 
                      onPress: () => {
                        Alert.alert('TikTok Share', 'TikTok sharing requires the mobile app. Copy the link and share it in your TikTok bio or video description!');
                      }
                    },
                    { 
                      text: 'Reddit', 
                      onPress: () => {
                        const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(profileUrl)}&title=${encodeURIComponent(`Check out ${user.displayName} on FREQ`)}`;
                        if (Platform.OS === 'web') {
                          try {
                            window.open(redditUrl, '_blank');
                          } catch (error) {
                            Alert.alert('Error', 'Unable to open Reddit. Please copy the link manually.');
                          }
                        } else {
                          Alert.alert('Reddit Share', `Would open: ${redditUrl}`);
                        }
                      }
                    }
                  ]
                );
              }
            },
            { 
              text: 'Email', 
              onPress: () => {
                const emailSubject = `Check out ${user.displayName} on FREQ`;
                const emailBody = shareMessage;
                const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                if (Platform.OS === 'web') {
                  try {
                    window.location.href = emailUrl;
                  } catch (error) {
                    Alert.alert('Error', 'Unable to open email client. Please copy the link manually.');
                  }
                } else {
                  Alert.alert('Email Share', `Would open email client with: ${emailSubject}`);
                }
              }
            }
          ]
        );
      } else {
        // Native sharing with additional platform options
        Alert.alert(
          'Share Profile',
          'Choose how to share:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Native Share',
              onPress: async () => {
                try {
                  const result = await Share.share({
                    message: shareMessage,
                    url: profileUrl,
                    title: `${user.displayName} on FREQ`
                  });
                  
                  if (result.action === Share.sharedAction) {
                    Alert.alert('Success', 'Profile shared successfully!');
                  }
                } catch (error) {
                  Alert.alert('Error', 'Unable to share profile');
                }
              }
            },
            {
              text: 'Copy Link',
              onPress: () => {
                // For mobile, we'll show the link to copy manually
                Alert.alert(
                  'Profile Link',
                  profileUrl,
                  [
                    { text: 'OK' }
                  ]
                );
              }
            },
            {
              text: 'Social Media',
              onPress: () => {
                Alert.alert(
                  'Share on Social Media',
                  'Open your preferred social media app and paste this link:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Show Link',
                      onPress: () => {
                        Alert.alert('Profile Link', profileUrl);
                      }
                    }
                  ]
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share profile at this time');
      console.error('Share error:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: user.displayName,
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '600',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Share2 size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <MoreHorizontal size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ),
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          currentTrack && !isMinimized ? styles.contentWithPlayer : null,
        ]}
      >
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: user.avatarUrl || defaultAvatarUri }} 
            style={styles.avatar}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            
            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => setShowFollowersModal(true)}
              >
                <Text style={styles.statValue}>{user.tracksCount}</Text>
                <Text style={styles.statLabel}>Tracks</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => setShowFollowersModal(true)}
              >
                <Text style={styles.statValue}>{user.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => setShowFollowingModal(true)}
              >
                <Text style={styles.statValue}>{user.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
            
            {user.bio && (
              <Text style={styles.bio}>{user.bio}</Text>
            )}
            
            <View style={styles.profileActions}>
              <TouchableOpacity 
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton
                ]}
                onPress={toggleFollow}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} color={colors.text} />
                    <Text style={styles.followButtonText}>Following</Text>
                  </>
                ) : (
                  <>
                    <Plus size={16} color={colors.text} />
                    <Text style={styles.followButtonText}>Follow</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <MessageCircle size={16} color={colors.text} />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.tracksContainer}>
          {userTracks.length > 0 ? (
            <TrackList 
              title={`Tracks by ${user.displayName}`} 
              tracks={userTracks}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No tracks yet</Text>
              <Text style={styles.emptyStateText}>
                This user hasn't uploaded any tracks yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {currentTrack && isMinimized && <MiniPlayer />}
      
      <FollowersModal
        visible={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Followers"
        users={users.slice(0, 3)} // Mock followers
      />
      
      <FollowersModal
        visible={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Following"
        users={users.slice(1, 4)} // Mock following
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    marginLeft: 8,
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginHorizontal: 8,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
  },
  contentWithPlayer: {
    paddingBottom: 0,
  },
  profileHeader: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.cardElevated,
  },
  profileInfo: {
    alignItems: 'center',
  },
  displayName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  bio: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  followButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  followingButton: {
    backgroundColor: colors.cardElevated,
  },
  followButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    flexDirection: 'row',
    backgroundColor: colors.cardElevated,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  messageButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  tracksContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  emptyStateTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
});