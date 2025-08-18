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
            <div className="fallback-content">
              <section className="hero-section">
                <h2>Welcome to Student Document Hub</h2>
                <p>Your centralized platform for managing engineering projects, course documents, and academic files. Upload, organize, and access your academic work with automatic categorization and tagging.</p>
              </section>
              
              <section className="features-section">
                <h3>Features</h3>
                <div className="features-grid">
                  <div className="feature-card">
                    <h4>Smart Categorization</h4>
                    <p>Automatic file categorization by type: Documents, CAD, Code, Images, and more</p>
                  </div>
                  <div className="feature-card">
                    <h4>Enhanced Metadata</h4>
                    <p>Add course codes, descriptions, tags, and semester information to organize your work</p>
                  </div>
                  <div className="feature-card">
                    <h4>Advanced Search & Filter</h4>
                    <p>Find files quickly by category, tags, course code, or content search</p>
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
