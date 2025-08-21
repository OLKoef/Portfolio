import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm, UserInfo, SignOutButton } from './components/Auth';
import BuilderContent, { BuilderPage } from './components/BuilderContent';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">BØY</h1>
          <nav className="main-nav">
            <button
              className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-button ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio
            </button>
            <button
              className={`nav-button ${activeTab === 'tools' ? 'active' : ''}`}
              onClick={() => setActiveTab('tools')}
            >
              Tools
            </button>
            <button
              className={`nav-button ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              Resources
            </button>
          </nav>
          <div className="header-user-actions">
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="user-profile-corner">
          <UserInfo />
        </div>
        {activeTab === 'portfolio' && (
          <div className="portfolio-content">
            <BuilderPage urlPath="/" />
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="tools-content">
            <h2>Tools</h2>
            <p>Access various tools and utilities for your projects.</p>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="resources-content">
            <h2>Resources</h2>
            <p>Helpful resources and documentation for your projects.</p>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Dashboard content intentionally left empty */}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Portfolio. Built with React, Firebase, and Builder.io</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
