import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { auth, initializeAnonymousAuth } from '@/lib/firebase';

export const firebaseAuth = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  // Create new user account
  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Update user profile
  updateProfile: async (updates: { displayName?: string; photoURL?: string }) => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        return { error: null };
      }
      return { error: 'No user logged in' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Send password reset email
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        return { error: null };
      }
      return { error: 'No user logged in' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => auth.currentUser,

  // Initialize anonymous authentication
  initializeAnonymous: async () => {
    try {
      const user = await initializeAnonymousAuth();
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },
};