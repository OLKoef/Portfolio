import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm, UserInfo, SignOutButton } from './components/Auth';
import BuilderContent, { BuilderPage } from './components/BuilderContent';
import BasicCalculator from './components/BasicCalculator';
import EngineeringCalculator from './components/EngineeringCalculator';
import UnitConverter from './components/UnitConverter';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCalculator, setActiveCalculator] = useState(null);

  const openCalculator = (calculatorType) => {
    setActiveCalculator(calculatorType);
  };

  const closeCalculator = () => {
    setActiveCalculator(null);
  };

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
        {activeTab === 'dashboard' && (
          <div className="user-profile-corner">
            <UserInfo />
          </div>
        )}
        {activeTab === 'portfolio' && (
          <div className="portfolio-content">
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
            {/* Dashboard content intentionally left empty */}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Portfolio. Built with React, Firebase, and Builder.io</p>
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
