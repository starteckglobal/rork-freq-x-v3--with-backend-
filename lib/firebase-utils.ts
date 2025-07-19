// Re-export all Firebase services for easy access
export { firebaseAuth } from '@/services/firebase-auth';
export { firestore } from '@/services/firebase-firestore';
export { firebaseStorage } from '@/services/firebase-storage';
export { firebaseAnalytics } from '@/services/firebase-analytics';
export { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

// Re-export Firebase app and services
export { auth, db, storage, analytics } from '@/lib/firebase';

// Common Firebase types
export type { User } from 'firebase/auth';
export type { DocumentData, QueryConstraint } from 'firebase/firestore';