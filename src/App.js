import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm, UserInfo, SignOutButton } from './components/Auth';
import BuilderContent, { BuilderPage } from './components/BuilderContent';
import FileManager from './components/FileManager';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('portfolio');

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
              className={`nav-button ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio
            </button>
            <button
              className={`nav-button ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              Documents
            </button>
            <button
              className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
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

        {activeTab === 'files' && <FileManager />}

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard. This is where you can view analytics and manage your content.</p>
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
