import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFrgecZiCtz7XNbjyM-AeHrtJphib30Yw",
  authDomain: "freqx-d11ef.firebaseapp.com",
  projectId: "freqx-d11ef",
  storageBucket: "freqx-d11ef.firebasestorage.app",
  messagingSenderId: "987682339177",
  appId: "1:987682339177:web:93e82c2bf84e724bdba5f8",
  measurementId: "G-VX8ED7ZVZH"
};

// Initialize Firebase - check if app already exists to prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only on web platform
export const analytics = Platform.OS === 'web' ? getAnalytics(app) : null;

export default app;