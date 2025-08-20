import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadService } from '../services/fileUpload';
import { OrganizationService } from '../services/organizationService';
import { isFirebaseConfigured } from '../firebase/config';

export default function FileUpload({ onUploadSuccess, onUploadError, selectedOrg = null }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metadata, setMetadata] = useState({
    description: '',
    semester: '',
    subject: '',
    courseCode: '',
    assignmentType: '',
    tags: '',
    visibility: selectedOrg ? 'org' : 'private'
  });
  const fileInputRef = useRef();
  const { currentUser } = useAuth();

  const handleFileSelect = (files) => {
    if (!currentUser) {
      onUploadError?.('Vennligst logg inn for å laste opp filer');
      return;
    }

    if (!files || files.length === 0) {
      onUploadError?.('Ingen filer valgt');
      return;
    }

    const fileArray = Array.from(files);

    // Validate files using Norwegian specifications
    const validation = FileUploadService.validateFiles(fileArray);

    if (!validation.isValid) {
      onUploadError?.(`Filvalidering feilet:\n${validation.errors.join('\n')}`);
      return;
    }

    setSelectedFiles(fileArray);
    setShowMetadataForm(true);
  };
  
  const handleUploadWithMetadata = async () => {
    if (!isFirebaseConfigured) {
      onUploadError?.('Firebase er ikke konfigurert riktig. Kontakt support.');
      return;
    }

    if (!currentUser) {
      onUploadError?.('Du må være logget inn for å laste opp filer');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const additionalMetadata = {
        ...metadata,
        tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      const uploadResults = [];
      const uploadErrors = [];

      // Upload files one by one with progress tracking and delay between uploads
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          // Update progress
          setUploadProgress(Math.round((i / selectedFiles.length) * 100));

          // Small delay between uploads to prevent stream conflicts
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const result = await FileUploadService.uploadFile(
            file,
            currentUser.uid,
            selectedOrg?.id || null,
            additionalMetadata
          );
          uploadResults.push(result);
        } catch (error) {
          console.error(`Upload error for ${file.name}:`, error);
          uploadErrors.push(`${file.name}: ${error.message}`);
        }
      }

      setUploadProgress(100);

      // Small delay to show 100% progress before success state
      setTimeout(() => {
        if (uploadResults.length > 0) {
          // Show success state immediately
          setShowSuccess(true);
          setUploading(false);

          // Call success callback
          onUploadSuccess?.(uploadResults);

          // Keep success message visible for longer
          setTimeout(() => {
            setShowSuccess(false);
            resetForm();
          }, 8000);
        } else {
          setUploading(false);
        }
      }, 800);

      if (uploadErrors.length > 0) {
        onUploadError?.(`Noen filer kunne ikke lastes opp:\n${uploadErrors.join('\n')}`);
      }

      if (uploadErrors.length > 0) {
        onUploadError?.(`Noen filer kunne ikke lastes opp:\n${uploadErrors.join('\n')}`);
      }

    } catch (error) {
      onUploadError?.(error.message);
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleQuickUpload = async () => {
    if (!isFirebaseConfigured) {
      onUploadError?.('Firebase er ikke konfigurert riktig. Kontakt support.');
      return;
    }

    if (!currentUser) {
      onUploadError?.('Du må være logget inn for å laste opp filer');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadResults = [];
      const uploadErrors = [];

      // Upload files with auto-categorization and delay between uploads
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          setUploadProgress(Math.round((i / selectedFiles.length) * 100));

          // Small delay between uploads to prevent stream conflicts
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const result = await FileUploadService.uploadFile(
            file,
            currentUser.uid,
            selectedOrg?.id || null
          );
          uploadResults.push(result);
        } catch (error) {
          console.error(`Upload error for ${file.name}:`, error);
          uploadErrors.push(`${file.name}: ${error.message}`);
        }
      }

      setUploadProgress(100);

      // Small delay to show 100% progress before success state
      setTimeout(() => {
        if (uploadResults.length > 0) {
          // Show success state immediately
          setShowSuccess(true);
          setUploading(false);

          // Call success callback
          onUploadSuccess?.(uploadResults);

          // Keep success message visible for longer
          setTimeout(() => {
            setShowSuccess(false);
            resetForm();
          }, 8000);
        } else {
          setUploading(false);
        }
      }, 800);

      if (uploadErrors.length > 0) {
        onUploadError?.(`Noen filer kunne ikke lastes opp:\n${uploadErrors.join('\n')}`);
      }

    } catch (error) {
      onUploadError?.(error.message);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setShowMetadataForm(false);
    setMetadata({
      description: '',
      semester: '',
      subject: '',
      courseCode: '',
      assignmentType: '',
      tags: '',
      visibility: selectedOrg ? 'org' : 'private'
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      {/* Upload destination indicator */}
      {selectedOrg && (
        <div className="upload-destination">
          <svg className="destination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Laster opp til: <strong>{selectedOrg.name}</strong></span>
        </div>
      )}

      {!showMetadataForm ? (
        <>
          <div
            className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="upload-progress">
                <div className="progress-circle">
                  <div className="progress-ring">
                    <svg className="progress-svg" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - uploadProgress / 100)}`}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="progress-text">{uploadProgress}%</div>
                  </div>
                </div>
                <p>Laster opp filer...</p>
                <p className="upload-subtitle">Norwegian GDPR-compliant lagring</p>
              </div>
            ) : showSuccess ? (
              <div className="upload-success">
                <div className="success-animation">
                  <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3>✅ Opplasting fullført!</h3>
                <p className="success-subtitle">{selectedFiles.length} fil(er) er lastet opp og lagret sikkert</p>
                <p className="success-details">Filene er nå tilgjengelige i systemet og klar for bruk</p>
                <div className="success-files-list">
                  <strong>Opplastede filer:</strong>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="success-file-item">
                      📄 {file.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="upload-prompt">
                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p>Slipp filer her eller klikk for å bla gjennom</p>
                <p className="upload-hint">
                  Støtter: PDF, DOCX, XLSX, PNG, JPG, DWG, DXF
                </p>
                <p className="upload-limit">Maks 200MB per fil • GDPR-kompatibel lagring</p>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files)}
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.dwg,.dxf"
          />
        </>
      ) : (
        <div className="metadata-form">
          <h3>Legg til fildetaljer</h3>
          <div className="selected-files-summary">
            <p><strong>{selectedFiles.length} fil(er) valgt:</strong></p>
            <div className="files-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-summary">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="metadata-grid">
            <div className="form-group">
              <label htmlFor="description">Beskrivelse</label>
              <textarea
                id="description"
                placeholder="Kort beskrivelse av filene..."
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                className="form-textarea"
                rows={3}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="courseCode">Emnekode</label>
                <input
                  id="courseCode"
                  type="text"
                  placeholder="f.eks. TKT4140"
                  value={metadata.courseCode}
                  onChange={(e) => setMetadata(prev => ({ ...prev, courseCode: e.target.value.toUpperCase() }))}
                  className="form-input"
                  pattern="[A-Z]{2,5}[0-9]{3,4}"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="semester">Semester</label>
                <select
                  id="semester"
                  value={metadata.semester}
                  onChange={(e) => setMetadata(prev => ({ ...prev, semester: e.target.value }))}
                  className="form-select"
                >
                  <option value="">Velg semester</option>
                  <option value="H24">Høst 2024</option>
                  <option value="V25">Vår 2025</option>
                  <option value="H25">Høst 2025</option>
                  <option value="V26">Vår 2026</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="subject">Fag/Emne</label>
                <input
                  id="subject"
                  type="text"
                  placeholder="f.eks. Konstruksjonsteknikk"
                  value={metadata.subject}
                  onChange={(e) => setMetadata(prev => ({ ...prev, subject: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="assignmentType">Type oppgave</label>
                <select
                  id="assignmentType"
                  value={metadata.assignmentType}
                  onChange={(e) => setMetadata(prev => ({ ...prev, assignmentType: e.target.value }))}
                  className="form-select"
                >
                  <option value="">Velg type</option>
                  <option value="øving">Øving</option>
                  <option value="oppgave">Oppgave</option>
                  <option value="prosjekt">Prosjekt</option>
                  <option value="rapport">Rapport</option>
                  <option value="eksamen">Eksamen</option>
                  <option value="presentasjon">Presentasjon</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">Stikkord (kommaseparert)</label>
              <input
                id="tags"
                type="text"
                placeholder="f.eks. hjemmeoppgave, gruppe, teoretisk"
                value={metadata.tags}
                onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleQuickUpload}
              className="upload-button quick"
              disabled={uploading}
            >
              Hurtigopplasting
            </button>
            <button 
              type="button" 
              onClick={handleUploadWithMetadata}
              className="upload-button detailed"
              disabled={uploading}
            >
              Last opp med detaljer
            </button>
            <button 
              type="button" 
              onClick={resetForm}
              className="upload-button cancel"
              disabled={uploading}
            >
              Avbryt
            </button>
          </div>
          
          <div className="compliance-notice">
            <svg className="shield-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>GDPR-kompatibel lagring i EU • Norsk personvernlovgivning</span>
          </div>
        </div>
      )}
    </div>
  );
}
