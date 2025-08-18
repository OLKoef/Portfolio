import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadService } from '../services/fileUpload';

export default function FileUpload({ onUploadSuccess, onUploadError }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [metadata, setMetadata] = useState({
    description: '',
    semester: '',
    subject: '',
    tags: '',
    isPublic: false
  });
  const fileInputRef = useRef();
  const { currentUser } = useAuth();

  const handleFileSelect = (files) => {
    if (!currentUser) {
      onUploadError?.('Please log in to upload files');
      return;
    }

    const fileArray = Array.from(files);

    // Validate files before proceeding
    const validation = FileUploadService.validateFiles(fileArray);
    if (!validation.isValid) {
      onUploadError?.(`File validation failed:\n${validation.errors.join('\n')}`);
      return;
    }

    setSelectedFiles(fileArray);
    setShowMetadataForm(true);
  };
  
  const handleUploadWithMetadata = async () => {
    setUploading(true);

    try {
      const additionalMetadata = {
        ...metadata,
        tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      const uploadResults = [];
      const uploadErrors = [];

      // Upload files one by one to handle individual errors
      for (const file of selectedFiles) {
        try {
          const result = await FileUploadService.uploadFile(file, currentUser.uid, 'uploads', additionalMetadata);
          uploadResults.push(result);
        } catch (error) {
          uploadErrors.push(`${file.name}: ${error.message}`);
        }
      }

      if (uploadResults.length > 0) {
        onUploadSuccess?.(uploadResults);
      }

      if (uploadErrors.length > 0) {
        onUploadError?.(`Some files failed to upload:\n${uploadErrors.join('\n')}`);
      }

      // Reset form
      setSelectedFiles([]);
      setShowMetadataForm(false);
      setMetadata({
        description: '',
        semester: '',
        subject: '',
        tags: '',
        isPublic: false
      });
    } catch (error) {
      onUploadError?.(error.message);
    } finally {
      setUploading(false);
    }
  };
  
  const handleQuickUpload = async () => {
    setUploading(true);

    try {
      const uploadResults = [];
      const uploadErrors = [];

      // Upload files one by one to handle individual errors
      for (const file of selectedFiles) {
        try {
          const result = await FileUploadService.uploadFile(file, currentUser.uid);
          uploadResults.push(result);
        } catch (error) {
          uploadErrors.push(`${file.name}: ${error.message}`);
        }
      }

      if (uploadResults.length > 0) {
        onUploadSuccess?.(uploadResults);
      }

      if (uploadErrors.length > 0) {
        onUploadError?.(`Some files failed to upload:\n${uploadErrors.join('\n')}`);
      }

      // Reset form
      setSelectedFiles([]);
      setShowMetadataForm(false);
    } catch (error) {
      onUploadError?.(error.message);
    } finally {
      setUploading(false);
    }
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

  return (
    <div className="file-upload-container">
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
                <div className="spinner"></div>
                <p>Uploading files...</p>
              </div>
            ) : (
              <div className="upload-prompt">
                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p>Drop files here or click to browse</p>
                <p className="upload-hint">Supports PDF, DOCX, CAD, images, and code files</p>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files)}
            accept=".pdf,.docx,.doc,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ods,.ppt,.pptx,.odp,.jpg,.jpeg,.png,.gif,.svg,.bmp,.webp,.dwg,.dxf,.step,.stp,.iges,.igs,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.php,.rb,.go,.rs,.zip,.rar,.7z,.tar,.gz,.md,.json,.xml,.yaml,.yml"
          />
        </>
      ) : (
        <div className="metadata-form">
          <h3>Add File Details (Optional)</h3>
          <p className="selected-files-info">
            Selected {selectedFiles.length} file(s): {selectedFiles.map(f => f.name).join(', ')}
          </p>
          
          <div className="metadata-grid">
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Brief description of the files..."
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                className="form-textarea"
                rows={3}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="semester">Semester</label>
                <input
                  id="semester"
                  type="text"
                  placeholder="e.g., Fall 2024"
                  value={metadata.semester}
                  onChange={(e) => setMetadata(prev => ({ ...prev, semester: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject/Course</label>
                <input
                  id="subject"
                  type="text"
                  placeholder="e.g., Structural Engineering"
                  value={metadata.subject}
                  onChange={(e) => setMetadata(prev => ({ ...prev, subject: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                id="tags"
                type="text"
                placeholder="e.g., homework, project, final-exam"
                value={metadata.tags}
                onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                className="form-input"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={metadata.isPublic}
                  onChange={(e) => setMetadata(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
                <span>Make files publicly accessible</span>
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleQuickUpload}
              className="upload-button quick"
              disabled={uploading}
            >
              Quick Upload (Auto-categorize)
            </button>
            <button 
              type="button" 
              onClick={handleUploadWithMetadata}
              className="upload-button detailed"
              disabled={uploading}
            >
              Upload with Details
            </button>
            <button 
              type="button" 
              onClick={() => {
                setShowMetadataForm(false);
                setSelectedFiles([]);
              }}
              className="upload-button cancel"
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
