import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYhbuKyslMYe7tVe005ySYxUc2hKwI4r0",
  authDomain: "freq-8a96f.firebaseapp.com",
  projectId: "freq-8a96f",
  storageBucket: "freq-8a96f.firebasestorage.app",
  messagingSenderId: "58399058860",
  appId: "1:58399058860:web:8bee89b78da5d599c76809",
  measurementId: "G-9V5CEDKXF4"
};

// Initialize Firebase - check if app already exists to prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only on web platform
export const analytics = Platform.OS === 'web' ? getAnalytics(app) : null;

// Initialize anonymous authentication for storage access
// This function will be called when needed, not immediately
export const initializeAnonymousAuth = async () => {
  try {
    if (!auth.currentUser) {
      console.log('Initializing anonymous authentication...');
      const userCredential = await signInAnonymously(auth);
      console.log('Anonymous authentication successful:', userCredential.user.uid);
      return userCredential.user;
    }
    return auth.currentUser;
  } catch (error: any) {
    console.error('Failed to initialize anonymous authentication:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/configuration-not-found') {
      console.error('Firebase Auth configuration not found. Please check Firebase Console settings.');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.error('Anonymous authentication is not enabled. Please enable it in Firebase Console.');
    }
    
    throw error;
  }
};

export default app;