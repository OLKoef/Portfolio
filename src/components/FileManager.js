import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadService } from '../services/fileUpload';
import FileUpload from './FileUpload';

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadFiles();
    }
  }, [currentUser]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const userFiles = await FileUploadService.getUserFiles(currentUser.uid);
      setFiles(userFiles);
    } catch (error) {
      setMessage(`Error loading files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (uploadedFiles) => {
    setFiles(prev => [...prev, ...uploadedFiles]);
    setMessage(`Successfully uploaded ${uploadedFiles.length} file(s)`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUploadError = (error) => {
    setMessage(`Upload error: ${error}`);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleDeleteFile = async (fileId, storagePath) => {
    try {
      await FileUploadService.deleteFile(fileId, storagePath);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      setMessage('File deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error deleting file: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('javascript') || type.includes('typescript')) return '💻';
    return '📁';
  };

  if (!currentUser) {
    return (
      <div className="file-manager">
        <p>Please log in to manage your files.</p>
      </div>
    );
  }

  return (
    <div className="file-manager">
      <h2>File Manager</h2>
      
      {message && (
        <div className={`message ${message.includes('Error') || message.includes('error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      <FileUpload 
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
      
      {loading ? (
        <div className="loading">Loading files...</div>
      ) : (
        <div className="files-list">
          <h3>Your Files ({files.length})</h3>
          {files.length === 0 ? (
            <p className="no-files">No files uploaded yet.</p>
          ) : (
            <div className="files-grid">
              {files.map(file => (
                <div key={file.id} className="file-card">
                  <div className="file-info">
                    <span className="file-icon">{getFileIcon(file.type)}</span>
                    <div className="file-details">
                      <h4 className="file-name" title={file.name}>{file.name}</h4>
                      <p className="file-meta">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="file-actions">
                    <a 
                      href={file.downloadURL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-action download"
                      title="Download"
                    >
                      ⬇️
                    </a>
                    <button 
                      onClick={() => handleDeleteFile(file.id, file.storagePath)}
                      className="file-action delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
