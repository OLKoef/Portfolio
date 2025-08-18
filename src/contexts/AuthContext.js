import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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

  const googleProvider = new GoogleAuthProvider();

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

  async function signup(email, password) {
    if (!auth) throw new Error('Firebase Auth not configured');
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function login(email, password) {
    if (!auth) throw new Error('Firebase Auth not configured');
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    if (!auth) throw new Error('Firebase Auth not configured');
    return signInWithPopup(auth, googleProvider);
  }

  async function logout() {
    if (!auth) throw new Error('Firebase Auth not configured');
    return signOut(auth);
  }

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
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
