import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm, UserProfile } from './components/Auth';
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
          <h1 className="app-title">Portfolio</h1>
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
              Files
            </button>
          </nav>
          <UserProfile />
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'portfolio' && (
          <div className="portfolio-content">
            <BuilderPage urlPath="/" />
            <div className="fallback-content">
              <section className="hero-section">
                <h2>Welcome to Your Portfolio</h2>
                <p>This content is managed through Builder.io. Connect your Builder.io account and create content to see it here.</p>
              </section>
              
              <section className="features-section">
                <h3>Features</h3>
                <div className="features-grid">
                  <div className="feature-card">
                    <h4>Content Management</h4>
                    <p>Manage your portfolio content with Builder.io's visual editor</p>
                  </div>
                  <div className="feature-card">
                    <h4>File Storage</h4>
                    <p>Upload and manage your documents, images, and code files</p>
                  </div>
                  <div className="feature-card">
                    <h4>Authentication</h4>
                    <p>Secure login with email/password or Google authentication</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
        
        {activeTab === 'files' && <FileManager />}
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
