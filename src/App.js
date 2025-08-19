import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm, UserInfo, SignOutButton } from './components/Auth';
import BuilderContent, { BuilderPage } from './components/BuilderContent';
import FileUpload from './components/FileUpload';
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

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <h2>Upload Files</h2>
            {uploadMessage && (
              <div className={`message ${messageType}`}>
                {uploadMessage}
              </div>
            )}
            <FileUpload
              onUploadSuccess={(results) => {
                setUploadMessage(`Successfully uploaded ${results.length} file(s)`);
                setMessageType('success');
                setTimeout(() => setUploadMessage(''), 5000);
              }}
              onUploadError={(error) => {
                setUploadMessage(error);
                setMessageType('error');
                setTimeout(() => setUploadMessage(''), 10000);
              }}
            />
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
