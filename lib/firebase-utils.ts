// Re-export all Firebase services for easy access
export { firebaseAuth } from '@/services/firebase-auth';
export { firestore } from '@/services/firebase-firestore';
export { firebaseStorage } from '@/services/firebase-storage';
export { firebaseAnalytics } from '@/services/firebase-analytics';
export { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

// Re-export Firebase app and services
export { auth, db, storage, analytics, initializeAnonymousAuth } from '@/lib/firebase';

// Common Firebase types
export type { User } from 'firebase/auth';
export type { DocumentData, QueryConstraint } from 'firebase/firestore';

// Firebase utilities for debugging and testing
export const firebaseUtils = {
  // Test Firebase connection and authentication
  testConnection: async () => {
    try {
      console.log('Testing Firebase connection...');
      
      // Check if Firebase is initialized
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      console.log('Firebase Auth initialized successfully');
      
      // Test anonymous authentication
      console.log('Testing anonymous authentication...');
      const result = await firebaseAuth.initializeAnonymous();
      
      if (result.error) {
        throw new Error(`Anonymous auth failed: ${result.error}`);
      }
      
      console.log('Anonymous authentication successful:', result.user?.uid);
      
      return {
        success: true,
        message: 'Firebase connection and authentication working properly',
        userId: result.user?.uid
      };
    } catch (error: any) {
      console.error('Firebase test failed:', error);
      
      let errorMessage = error.message || 'Unknown error';
      let suggestions: string[] = [];
      
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase Auth configuration not found';
        suggestions = [
          'Check if Firebase project is properly configured',
          'Verify API key and project settings in Firebase Console',
          'Ensure Authentication is enabled in Firebase Console'
        ];
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Anonymous authentication is not enabled';
        suggestions = [
          'Enable Anonymous authentication in Firebase Console',
          'Go to Authentication > Sign-in method > Anonymous > Enable'
        ];
      } else if (error.code === 'auth/api-key-not-valid') {
        errorMessage = 'Invalid API key';
        suggestions = [
          'Check if the API key in firebase config is correct',
          'Regenerate API key in Firebase Console if needed'
        ];
      }
      
      return {
        success: false,
        error: errorMessage,
        suggestions,
        code: error.code
      };
    }
  },
  
  // Get current authentication status
  getAuthStatus: () => {
    const currentUser = auth.currentUser;
    return {
      isAuthenticated: !!currentUser,
      userId: currentUser?.uid || null,
      isAnonymous: currentUser?.isAnonymous || false,
      providerData: currentUser?.providerData || []
    };
  },
  
  // Force re-authentication
  forceReauth: async () => {
    try {
      if (auth.currentUser) {
        await firebaseAuth.signOut();
      }
      
      const result = await initializeAnonymousAuth();
      return {
        success: true,
        userId: result.uid
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Export for debugging in development
if (__DEV__) {
  // @ts-ignore
  global.firebaseUtils = firebaseUtils;
  console.log('Firebase utils available globally as firebaseUtils');
}