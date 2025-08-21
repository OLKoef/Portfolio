import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm, UserInfo, SignOutButton } from './components/Auth';
import BuilderContent, { BuilderPage } from './components/BuilderContent';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadMessage, setUploadMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <h2>Dashboard</h2>
            <div className="dashboard-overview">
              <div className="welcome-section">
                <h3>Velkommen til BØY Portfolio</h3>
                <p>Bygg og administrer din digitale portfolio med våre verktøy og tjenester.</p>
              </div>

              <div className="dashboard-stats">
                <div className="stat-card">
                  <h4>Portfolio Status</h4>
                  <p>Ditt portfolio er aktivt og tilgjengelig</p>
                </div>

                <div className="stat-card">
                  <h4>Profil</h4>
                  <p>Profilen din er fullstendig og oppdatert</p>
                </div>

                <div className="stat-card">
                  <h4>Verktøy</h4>
                  <p>Utforsk verktøy for å forbedre portfolioen din</p>
                </div>
              </div>

              <div className="quick-actions">
                <h3>Hurtighandlinger</h3>
                <div className="action-buttons">
                  <button
                    className="action-button"
                    onClick={() => setActiveTab('portfolio')}
                  >
                    📁 Se Portfolio
                  </button>
                  <button
                    className="action-button"
                    onClick={() => setActiveTab('tools')}
                  >
                    🛠️ Bruk Verktøy
                  </button>
                </div>
              </div>
            </div>
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
