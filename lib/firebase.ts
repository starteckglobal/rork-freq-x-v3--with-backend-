import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
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

export default app;