import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadService } from '../services/fileUpload';

export default function FileUpload({ onUploadSuccess, onUploadError }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();
  const { currentUser } = useAuth();

  const handleFileSelect = async (files) => {
    if (!currentUser) {
      onUploadError?.('Please log in to upload files');
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(file => 
        FileUploadService.uploadFile(file, currentUser.uid)
      );
      
      const uploadedFiles = await Promise.all(uploadPromises);
      onUploadSuccess?.(uploadedFiles);
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
            <p className="upload-hint">Supports PDF, DOCX, images, and code files</p>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
        accept=".pdf,.docx,.doc,.txt,.js,.jsx,.ts,.tsx,.css,.html,.png,.jpg,.jpeg,.gif,.svg"
      />
    </div>
  );
}
