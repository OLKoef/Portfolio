import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiUser, FiMoon, FiSun, FiGlobe, FiAlertTriangle } from 'react-icons/fi';

export default function Settings({ onClose }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElement = useRef(null);
  
  // Form state tracking
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    academicYear: '',
    bio: '',
    theme: 'light',
    language: 'en'
  });
  
  const [originalData, setOriginalData] = useState({
    name: '',
    age: '',
    academicYear: '',
    bio: '',
    theme: 'light',
    language: 'en'
  });
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };
  
  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle close with unsaved changes check
  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };
  
  // Confirm discard changes
  const handleDiscardChanges = () => {
    setShowConfirmDialog(false);
    onClose();
  };
  
  // Save changes and close
  const handleSaveChanges = () => {
    setOriginalData(formData);
    setShowConfirmDialog(false);
    onClose();
  };
  
  // Cancel close action
  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

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
        handleClose();
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
            onClick={handleClose}
            aria-label="Close settings"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="settings-content">
          {/* User Profile Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <FiUser size={18} />
              <h4>Profile</h4>
            </div>
            <div className="settings-item">
              <label htmlFor="profile-name">Name</label>
              <input
                type="text"
                id="profile-name"
                className="settings-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="settings-item">
              <label htmlFor="profile-age">Age</label>
              <input
                type="number"
                id="profile-age"
                className="settings-input"
                placeholder="Enter your age"
                min="16"
                max="100"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
              />
            </div>
            <div className="settings-item">
              <label htmlFor="academic-year">Academic Year</label>
              <select 
                id="academic-year" 
                className="settings-select"
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
              >
                <option value="">Select your year</option>
                <option value="first">First Year</option>
                <option value="second">Second Year</option>
                <option value="third">Third Year</option>
                <option value="master">Master</option>
              </select>
            </div>
            <div className="settings-item">
              <label htmlFor="profile-bio">Bio</label>
              <textarea
                id="profile-bio"
                className="settings-textarea"
                rows="4"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
              ></textarea>
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
                <button 
                  className={`theme-option ${formData.theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleInputChange('theme', 'light')}
                >
                  <FiSun size={16} />
                  Light
                </button>
                <button 
                  className={`theme-option ${formData.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleInputChange('theme', 'dark')}
                >
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
              <select 
                className="settings-select"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="no">Norsk</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="settings-actions">
            <button className="settings-button primary" onClick={handleSaveChanges}>
              Save Changes
            </button>
            <button className="settings-button secondary" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
      
      {/* Unsaved Changes Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="confirmation-header">
              <FiAlertTriangle size={24} className="warning-icon" />
              <h3>Unsaved Changes</h3>
            </div>
            <p className="confirmation-message">
              You have unsaved changes. What would you like to do?
            </p>
            <div className="confirmation-actions">
              <button 
                className="settings-button primary" 
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
              <button 
                className="settings-button secondary" 
                onClick={handleDiscardChanges}
              >
                Discard Changes
              </button>
              <button 
                className="settings-button secondary" 
                onClick={handleCancelClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
