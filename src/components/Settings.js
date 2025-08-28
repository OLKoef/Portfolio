import React, { useEffect, useRef } from 'react';
import { FiX, FiUser, FiMoon, FiSun, FiGlobe, FiBell } from 'react-icons/fi';

export default function Settings({ onClose }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Focus management
  useEffect(() => {
    // Store the previously focused element
    previousActiveElement.current = document.activeElement;
    
    // Focus the close button when modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Handle escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Trap focus within modal
    const handleTabKey = (event) => {
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      
      // Return focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [onClose]);

  return (
    <div className="calculator-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-container" ref={modalRef}>
        <div className="calculator-header">
          <h3 id="settings-title">Settings</h3>
          <button 
            ref={closeButtonRef}
            className="close-button" 
            onClick={onClose}
            aria-label="Close settings"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="settings-content">
          {/* User Account Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <FiUser size={18} />
              <h4>Account</h4>
            </div>
            <div className="settings-item">
              <label>Profile Information</label>
              <p className="settings-description">Manage your account details and preferences</p>
              <button className="settings-button secondary">Edit Profile</button>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <FiMoon size={18} />
              <h4>Appearance</h4>
            </div>
            <div className="settings-item">
              <label>Theme</label>
              <div className="settings-theme-toggle">
                <button className="theme-option active">
                  <FiSun size={16} />
                  Light
                </button>
                <button className="theme-option">
                  <FiMoon size={16} />
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <FiGlobe size={18} />
              <h4>Language & Region</h4>
            </div>
            <div className="settings-item">
              <label>Language</label>
              <select className="settings-select">
                <option value="en">English</option>
                <option value="no">Norsk</option>
              </select>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <FiBell size={18} />
              <h4>Notifications</h4>
            </div>
            <div className="settings-item">
              <label>Calculator Sounds</label>
              <div className="settings-toggle">
                <input type="checkbox" id="calculator-sounds" />
                <label htmlFor="calculator-sounds" className="toggle-switch">
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="settings-item">
              <label>Email Notifications</label>
              <div className="settings-toggle">
                <input type="checkbox" id="email-notifications" defaultChecked />
                <label htmlFor="email-notifications" className="toggle-switch">
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="settings-actions">
            <button className="settings-button primary" onClick={onClose}>
              Save Changes
            </button>
            <button className="settings-button secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
