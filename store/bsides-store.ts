import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/id';

export interface BSideTrack {
  id: string;
  title: string;
  description: string;
  artistId: string;
  artistName: string;
  uploadedAt: string;
  duration?: number;
  fileUrl?: string;
  plays: number;
  likes: number;
}

export interface BSidesState {
  // Subscription status
  hasSubscription: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  
  // B-sides tracks
  bsideTracks: BSideTrack[];
  
  // Actions
  subscribe: () => void;
  unsubscribe: () => void;
  isSubscribed: () => boolean;
  uploadTrack: (title: string, description: string, artistId: string, artistName: string) => string;
  deleteTrack: (trackId: string) => void;
  getTracksByArtist: (artistId: string) => BSideTrack[];
  likeTrack: (trackId: string) => void;
  playTrack: (trackId: string) => void;
}

// Mock B-sides tracks for demo
const mockBSideTracks: BSideTrack[] = [
  {
    id: 'bside-1',
    title: 'Midnight Dreams (Demo Version)',
    description: 'The original demo version before we added the full production. Raw and emotional.',
    artistId: 'user-2',
    artistName: 'Luna Echo',
    uploadedAt: '2024-01-15T10:30:00Z',
    duration: 195,
    plays: 234,
    likes: 45,
  },
  {
    id: 'bside-2',
    title: 'Studio Session Jam #3',
    description: 'Spontaneous jam session that turned into something beautiful. Just me and my guitar.',
    artistId: 'user-2',
    artistName: 'Luna Echo',
    uploadedAt: '2024-01-10T14:20:00Z',
    duration: 312,
    plays: 156,
    likes: 28,
  },
  {
    id: 'bside-3',
    title: 'Electric Pulse (Acoustic)',
    description: 'Stripped down acoustic version of Electric Pulse. Completely different vibe.',
    artistId: 'user-3',
    artistName: 'Neon Waves',
    uploadedAt: '2024-01-08T16:45:00Z',
    duration: 248,
    plays: 189,
    likes: 37,
  },
];

export const useBSidesStore = create<BSidesState>()(
  persist(
    (set, get) => ({
      hasSubscription: false,
      bsideTracks: mockBSideTracks,
      
      subscribe: () => {
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        
        set({
          hasSubscription: true,
          subscriptionStartDate: now.toISOString(),
          subscriptionEndDate: endDate.toISOString(),
        });
        
        console.log('B-sides subscription activated');
      },
      
      unsubscribe: () => {
        set({
          hasSubscription: false,
          subscriptionStartDate: undefined,
          subscriptionEndDate: undefined,
        });
        
        console.log('B-sides subscription cancelled');
      },
      
      isSubscribed: () => {
        const { hasSubscription, subscriptionEndDate } = get();
        
        if (!hasSubscription || !subscriptionEndDate) {
          return false;
        }
        
        const now = new Date();
        const endDate = new Date(subscriptionEndDate);
        
        return endDate > now;
      },
      
      uploadTrack: (title, description, artistId, artistName) => {
        const newTrack: BSideTrack = {
          id: generateId(),
          title: title.trim(),
          description: description.trim(),
          artistId,
          artistName,
          uploadedAt: new Date().toISOString(),
          plays: 0,
          likes: 0,
        };
        
        const { bsideTracks } = get();
        const updatedTracks = [newTrack, ...bsideTracks];
        
        set({ bsideTracks: updatedTracks });
        
        console.log('B-side track uploaded:', newTrack.title);
        return newTrack.id;
      },
      
      deleteTrack: (trackId) => {
        const { bsideTracks } = get();
        const updatedTracks = bsideTracks.filter(track => track.id !== trackId);
        
        set({ bsideTracks: updatedTracks });
        
        console.log('B-side track deleted:', trackId);
      },
      
      getTracksByArtist: (artistId) => {
        const { bsideTracks } = get();
        return bsideTracks.filter(track => track.artistId === artistId);
      },
      
      likeTrack: (trackId) => {
        const { bsideTracks } = get();
        const updatedTracks = bsideTracks.map(track => 
          track.id === trackId 
            ? { ...track, likes: track.likes + 1 }
            : track
        );
        
        set({ bsideTracks: updatedTracks });
        
        console.log('B-side track liked:', trackId);
      },
      
      playTrack: (trackId) => {
        const { bsideTracks } = get();
        const updatedTracks = bsideTracks.map(track => 
          track.id === trackId 
            ? { ...track, plays: track.plays + 1 }
            : track
        );
        
        set({ bsideTracks: updatedTracks });
        
        console.log('B-side track played:', trackId);
      },
    }),
    {
      name: 'bsides-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSubscription: state.hasSubscription,
        subscriptionStartDate: state.subscriptionStartDate,
        subscriptionEndDate: state.subscriptionEndDate,
        bsideTracks: state.bsideTracks,
      }),
    }
  )
);