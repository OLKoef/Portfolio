import React, { useState } from 'react';
import { FiSettings, FiUpload, FiBookOpen, FiFolder, FiShield } from 'react-icons/fi';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm, UserInfo, SignOutButton } from './components/Auth';
import BuilderContent, { BuilderPage } from './components/BuilderContent';
import BasicCalculator from './components/BasicCalculator';
import EngineeringCalculator from './components/EngineeringCalculator';
import UnitConverter from './components/UnitConverter';
import Settings from './components/Settings';
import Admin from './components/Admin';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCalculator, setActiveCalculator] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [dragOverType, setDragOverType] = useState(null);

  const openCalculator = (calculatorType) => {
    setActiveCalculator(calculatorType);
  };

  const closeCalculator = () => {
    setActiveCalculator(null);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  // Helper function to filter files by type
  const filterFilesByType = (files, type) => {
    const allowedTypes = {
      notes: ['.pdf', '.doc', '.docx', '.txt', '.md'],
      resources: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.jpg', '.jpeg', '.png']
    };

    const extensions = allowedTypes[type] || [];
    return files.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return extensions.includes(extension);
    });
  };

  // Process uploaded files
  const processFiles = (files, type) => {
    const validFiles = filterFilesByType(files, type);
    if (validFiles.length > 0) {
      console.log(`Uploading ${validFiles.length} ${type}:`, validFiles.map(f => f.name));
      // TODO: Implement actual file upload to Supabase storage
      alert(`${validFiles.length} ${type} selected for upload: ${validFiles.map(f => f.name).join(', ')}`);
    } else {
      alert(`No valid ${type} files found. Please check file types.`);
    }
  };

  const handleUpload = (type) => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;

    // Set accepted file types based on upload type
    if (type === 'notes') {
      input.accept = '.pdf,.doc,.docx,.txt,.md';
    } else if (type === 'resources') {
      input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png';
    }

    input.onchange = (event) => {
      const files = Array.from(event.target.files);
      if (files.length > 0) {
        processFiles(files, type);
      }
    };

    input.click();
  };

  // Drag and drop handlers
  const handleDragEnter = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverType(type);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Only clear drag state if leaving the button entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverType(null);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverType(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files, type);
    }
  };

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <div className="app" aria-hidden={activeCalculator || showSettings ? 'true' : 'false'}>
      <header className="app-header" aria-hidden={activeCalculator || showSettings ? 'true' : 'false'}>
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
            <button
              className={`nav-button ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              aria-label="Admin"
            >
              <FiShield size={16} />
            </button>
          </nav>
          <div className="header-user-actions">
            <button className="settings-button" onClick={openSettings} aria-label="Settings">
              <FiSettings size={18} />
            </button>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="app-main" aria-hidden={activeCalculator || showSettings ? 'true' : 'false'}>
        {activeTab === 'portfolio' && (
          <div className="portfolio-content">
            <div className="portfolio-header">
              <h2>Portfolio 😊</h2>
            </div>
            <BuilderPage urlPath="/" />
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="tools-content">
            <div className="calculations-view">
              <h3>Calculations</h3>
              <p>Perform various calculations and computational tasks.</p>
              <div className="calculation-tools">
                <div className="tool-card clickable" onClick={() => openCalculator('basic')}>
                  <h4>Basic Calculator</h4>
                  <p>Simple arithmetic calculations</p>
                  <div className="tool-card-action">Click to open</div>
                </div>
                <div className="tool-card clickable" onClick={() => openCalculator('engineering')}>
                  <h4>Engineering Calculator</h4>
                  <p>Advanced mathematical functions</p>
                  <div className="tool-card-action">Click to open</div>
                </div>
                <div className="tool-card clickable" onClick={() => openCalculator('converter')}>
                  <h4>Unit Converter</h4>
                  <p>Convert between different units</p>
                  <div className="tool-card-action">Click to open</div>
                </div>
              </div>
            </div>
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
            <div className="dashboard-welcome">
              <h2>Welcome to your Dashboard</h2>
              <p>Upload and manage your academic resources</p>
            </div>

            <div className="upload-section">
              <h3>Upload Content</h3>
              <div className="upload-buttons">
                <button
                  className={`upload-button notes-upload ${dragOverType === 'notes' ? 'drag-over' : ''}`}
                  onClick={() => handleUpload('notes')}
                  onDragEnter={(e) => handleDragEnter(e, 'notes')}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'notes')}
                >
                  <FiBookOpen size={24} />
                  <span className="upload-label">Upload Notes</span>
                  <span className="upload-description">
                    {dragOverType === 'notes' ? 'Drop your notes here!' : 'Add your study notes and documents'}
                  </span>
                </button>

                <button
                  className={`upload-button resources-upload ${dragOverType === 'resources' ? 'drag-over' : ''}`}
                  onClick={() => handleUpload('resources')}
                  onDragEnter={(e) => handleDragEnter(e, 'resources')}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'resources')}
                >
                  <FiFolder size={24} />
                  <span className="upload-label">Upload Resources</span>
                  <span className="upload-description">
                    {dragOverType === 'resources' ? 'Drop your resources here!' : 'Add learning resources and materials'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="admin-content">
            <Admin />
          </div>
        )}
      </main>

      <footer className="app-footer" aria-hidden={activeCalculator || showSettings ? 'true' : 'false'}>
        <p>&copy; 2024 Portfolio. Built with React, Supabase, and Builder.io</p>
      </footer>

      {/* Calculator Modals */}
      {activeCalculator === 'basic' && (
        <BasicCalculator onClose={closeCalculator} />
      )}
      {activeCalculator === 'engineering' && (
        <EngineeringCalculator onClose={closeCalculator} />
      )}
      {activeCalculator === 'converter' && (
        <UnitConverter onClose={closeCalculator} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings onClose={closeSettings} />
      )}
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
