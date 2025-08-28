import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup, authError } = useAuth();

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isSignup ? 'Create Account' : 'Sign In'}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          {(error || authError) && (
            <div className="error-message">
              {error || authError}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="auth-switch-button"
              disabled={loading}
            >
              {isSignup ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function UserInfo() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="user-info-card">
        <div className="user-details">
          <p className="user-name">Not authenticated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-card">
      <div className="user-details">
        <p className="user-name">{currentUser.email}</p>
        <p className="user-status">Signed in</p>
      </div>
    </div>
  );
}

export function SignOutButton() {
  const { logout, currentUser, loading } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <button 
      className="header-logout-button" 
      onClick={handleSignOut}
      disabled={loading}
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}

export function UserProfile() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="user-profile">
        <div className="user-info">
          <div className="user-details">
            <p className="user-name">Not authenticated</p>
            <p className="user-email">Please sign in</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-details">
          <p className="user-name">{currentUser.email}</p>
          <p className="user-email">User ID: {currentUser.id}</p>
          <p className="user-status">Account created: {new Date(currentUser.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
