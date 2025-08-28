import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('Supabase authentication not yet configured');

  // TODO: Implement Supabase authentication here
  async function signup(email, pin) {
    throw new Error('Authentication requires Supabase configuration. Please connect to Supabase.');
  }

  async function login(email, pin) {
    throw new Error('Authentication requires Supabase configuration. Please connect to Supabase.');
  }

  async function logout() {
    throw new Error('Authentication requires Supabase configuration. Please connect to Supabase.');
  }

  const value = {
    currentUser,
    signup,
    login,
    logout,
    authError,
    isFirebaseConfigured: false // Changed from firebaseError to authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
