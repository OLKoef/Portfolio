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
          <h1 className="app-title">Student Document Hub</h1>
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
          </nav>
          <UserProfile />
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'portfolio' && (
          <div className="portfolio-content">
            <BuilderPage urlPath="/" />
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
