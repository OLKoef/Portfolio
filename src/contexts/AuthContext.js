import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);


  // Check if Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setFirebaseError('Firebase is not properly configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    if (!auth) {
      setFirebaseError('Firebase Auth is not initialized.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signup(email, pin) {
    if (!auth) throw new Error('Firebase Auth not configured');

    // Validate PIN format
    if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      throw new Error('PIN must be 4-6 digits');
    }

    // Use email + PIN as password (you might want to hash this for production)
    const tempPassword = `${email}_${pin}_temp`;
    return createUserWithEmailAndPassword(auth, email, tempPassword);
  }

  async function login(email, pin) {
    if (!auth) throw new Error('Firebase Auth not configured');

    // Validate PIN format
    if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      throw new Error('PIN must be 4-6 digits');
    }

    // Use email + PIN as password (you might want to hash this for production)
    const tempPassword = `${email}_${pin}_temp`;
    return signInWithEmailAndPassword(auth, email, tempPassword);
  }


  async function logout() {
    if (!auth) throw new Error('Firebase Auth not configured');
    return signOut(auth);
  }

  const value = {
    currentUser,
    signup,
    login,
    logout,
    firebaseError,
    isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
