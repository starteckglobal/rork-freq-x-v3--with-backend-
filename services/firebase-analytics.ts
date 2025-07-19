import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '@/lib/firebase';
import { Platform } from 'react-native';

export const firebaseAnalytics = {
  // Log custom events
  logEvent: (eventName: string, parameters?: { [key: string]: any }) => {
    if (Platform.OS === 'web' && analytics) {
      logEvent(analytics, eventName, parameters);
    }
  },

  // Set user ID
  setUserId: (userId: string) => {
    if (Platform.OS === 'web' && analytics) {
      setUserId(analytics, userId);
    }
  },

  // Set user properties
  setUserProperties: (properties: { [key: string]: any }) => {
    if (Platform.OS === 'web' && analytics) {
      setUserProperties(analytics, properties);
    }
  },

  // Common events
  trackLogin: (method: string) => {
    firebaseAnalytics.logEvent('login', { method });
  },

  trackSignUp: (method: string) => {
    firebaseAnalytics.logEvent('sign_up', { method });
  },

  trackTrackPlay: (trackId: string, trackName: string, artist: string) => {
    firebaseAnalytics.logEvent('track_play', {
      track_id: trackId,
      track_name: trackName,
      artist: artist
    });
  },

  trackPlaylistCreate: (playlistId: string, playlistName: string) => {
    firebaseAnalytics.logEvent('playlist_create', {
      playlist_id: playlistId,
      playlist_name: playlistName
    });
  },

  trackShare: (contentType: string, contentId: string, method: string) => {
    firebaseAnalytics.logEvent('share', {
      content_type: contentType,
      content_id: contentId,
      method: method
    });
  },

  trackSearch: (searchTerm: string) => {
    firebaseAnalytics.logEvent('search', {
      search_term: searchTerm
    });
  },

  trackPageView: (pageName: string) => {
    firebaseAnalytics.logEvent('page_view', {
      page_title: pageName
    });
  },
};