import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup, loginWithGoogle, firebaseError, isFirebaseConfigured } = useAuth();

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
                <li>Enable Authentication (Email/Password and Google)</li>
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await loginWithGoogle();
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
        
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="auth-button google"
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        
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
