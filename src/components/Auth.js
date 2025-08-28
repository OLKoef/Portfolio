import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup, authError } = useAuth();

  // Show configuration message for Supabase setup
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Authentication Setup Required</h2>
        <div className="config-error">
          <h3>🔧 Supabase Setup Required</h3>
          <p>Authentication and database functionality requires Supabase to be configured.</p>
          
          <div className="setup-instructions">
            <h4>Next Steps:</h4>
            <ol>
              <li>Connect to Supabase using the MCP integration</li>
              <li>Configure authentication tables and policies</li>
              <li>Set up file storage buckets</li>
              <li>Configure environment variables</li>
            </ol>
          </div>

          {authError && (
            <div className="error-details">
              <strong>Status:</strong> {authError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserInfo() {
  return (
    <div className="user-info-card">
      <div className="user-details">
        <p className="user-name">Not authenticated</p>
        <p className="user-email">Supabase required</p>
      </div>
    </div>
  );
}

export function SignOutButton() {
  return (
    <button className="header-logout-button" disabled>
      Sign Out (Disabled)
    </button>
  );
}

export function UserProfile() {
  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-details">
          <p className="user-name">Authentication Required</p>
          <p className="user-email">Please configure Supabase</p>
        </div>
      </div>
    </div>
  );
}
