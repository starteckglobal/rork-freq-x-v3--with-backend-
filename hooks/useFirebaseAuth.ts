import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { firebaseAuth } from '@/services/firebase-auth';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await firebaseAuth.signIn(email, password);
    setLoading(false);
    return result;
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    const result = await firebaseAuth.signUp(email, password, displayName);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await firebaseAuth.signOut();
    setLoading(false);
    return result;
  };

  const resetPassword = async (email: string) => {
    return await firebaseAuth.resetPassword(email);
  };

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    return await firebaseAuth.updateProfile(updates);
  };

  const updateUserPassword = async (newPassword: string) => {
    return await firebaseAuth.updatePassword(newPassword);
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    isAuthenticated: !!user,
  };
};