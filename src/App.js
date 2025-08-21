import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm, UserInfo, SignOutButton } from './components/Auth';
import BuilderContent, { BuilderPage } from './components/BuilderContent';
import FileUpload from './components/FileUpload';
import FileUploadDebug from './components/FileUploadDebug';
import FirebaseTest from './components/FirebaseTest';
import SimpleFirestoreTest from './components/SimpleFirestoreTest';
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
            <h2>Upload Files</h2>
            {uploadMessage && (
              <div className={`message ${messageType}`}>
                {uploadMessage}
              </div>
            )}

            <SimpleFirestoreTest />

            <FirebaseTest />

            <FileUploadDebug
              onUploadSuccess={(results) => {
                setUploadMessage(`🎉 DEBUG: Successfully uploaded ${results.length} file(s)!`);
                setMessageType('success');
                setTimeout(() => setUploadMessage(''), 8000);
              }}
              onUploadError={(error) => {
                setUploadMessage(`❌ DEBUG: ${error}`);
                setMessageType('error');
                setTimeout(() => setUploadMessage(''), 10000);
              }}
            />

            <FileUpload
              onUploadSuccess={(results) => {
                setUploadMessage(`🎉 Vellykket opplasting! ${results.length} fil(er) er nå lagret sikkert og tilgjengelig i systemet. Du kan finne filene dine i filbehandleren.`);
                setMessageType('success');
                setTimeout(() => setUploadMessage(''), 12000);
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
