import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup, firebaseError, isFirebaseConfigured } = useAuth();

  // Show configuration error if Firebase is not set up
  if (!isFirebaseConfigured) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Configuration Required</h2>
          <div className="config-error">
            <h3>🔧 Firebase Setup Required</h3>
            <p>To use authentication and file storage, please configure your Firebase environment variables:</p>
            
            <div className="env-vars-list">
              <code>REACT_APP_FIREBASE_API_KEY</code>
              <code>REACT_APP_FIREBASE_AUTH_DOMAIN</code>
              <code>REACT_APP_FIREBASE_PROJECT_ID</code>
              <code>REACT_APP_FIREBASE_STORAGE_BUCKET</code>
              <code>REACT_APP_FIREBASE_MESSAGING_SENDER_ID</code>
              <code>REACT_APP_FIREBASE_APP_ID</code>
            </div>

            <div className="setup-instructions">
              <h4>Setup Instructions:</h4>
              <ol>
                <li>Create a Firebase project at <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
                <li>Enable Authentication (Email/Password)</li>
                <li>Enable Firestore and Storage</li>
                <li>Get your config values from Project Settings</li>
                <li>Add them as environment variables in your deployment platform</li>
              </ol>
            </div>

            {firebaseError && (
              <div className="error-details">
                <strong>Error:</strong> {firebaseError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <button type="submit" disabled={loading} className="auth-button primary">
            {loading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <div className="auth-switch">
          <span>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button 
            type="button" 
            onClick={() => setIsSignup(!isSignup)}
            className="auth-link"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserProfile() {
  const { currentUser, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {currentUser.email?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="user-details">
          <p className="user-name">{currentUser.displayName || 'User'}</p>
          <p className="user-email">{currentUser.email}</p>
        </div>
      </div>
      <button onClick={handleLogout} className="logout-button">
        Sign Out
      </button>
    </div>
  );
}
