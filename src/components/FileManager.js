import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadService } from '../services/fileUpload';
import FileUpload from './FileUpload';

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    searchTerm: '',
    courseCode: ''
  });
  const { currentUser, isFirebaseConfigured } = useAuth();

  useEffect(() => {
    if (currentUser && isFirebaseConfigured) {
      loadFiles();
    } else {
      setLoading(false);
    }
  }, [currentUser, isFirebaseConfigured]);

  // Apply filters whenever filters or files change
  useEffect(() => {
    applyFilters();
  }, [filters, files]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const userFiles = await FileUploadService.getUserFiles(currentUser.uid);
      setFiles(userFiles);
      setFilteredFiles(userFiles);
      
      // Load categories and tags
      const userCategories = await FileUploadService.getUserCategories(currentUser.uid);
      const userTags = await FileUploadService.getUserTags(currentUser.uid);
      setCategories(userCategories);
      setTags(userTags);
    } catch (error) {
      setMessage(`Error loading files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...files];
    
    if (filters.category) {
      filtered = filtered.filter(file => file.category === filters.category);
    }
    
    if (filters.tag) {
      filtered = filtered.filter(file => file.tags?.includes(filters.tag));
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(term) ||
        file.description?.toLowerCase().includes(term) ||
        file.subject?.toLowerCase().includes(term)
      );
    }
    
    if (filters.courseCode) {
      filtered = filtered.filter(file => 
        file.courseCode?.toLowerCase().includes(filters.courseCode.toLowerCase())
      );
    }
    
    setFilteredFiles(filtered);
  };
  
  const clearFilters = () => {
    setFilters({
      category: '',
      tag: '',
      searchTerm: '',
      courseCode: ''
    });
    setFilteredFiles(files);
  };

  const handleUploadSuccess = async (uploadedFiles) => {
    setFiles(prev => [...prev, ...uploadedFiles]);
    setMessage(`Successfully uploaded ${uploadedFiles.length} file(s)`);
    setTimeout(() => setMessage(''), 3000);
    
    // Reload categories and tags
    try {
      const userCategories = await FileUploadService.getUserCategories(currentUser.uid);
      const userTags = await FileUploadService.getUserTags(currentUser.uid);
      setCategories(userCategories);
      setTags(userTags);
    } catch (error) {
      console.error('Error reloading categories/tags:', error);
    }
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

  const getFileIcon = (type, category) => {
    if (category === 'CAD') return '🔧';
    if (category === 'Images') return '🖼️';
    if (category === 'Code') return '💻';
    if (category === 'Documents') return '📄';
    if (category === 'Presentations') return '📊';
    if (category === 'Spreadsheets') return '📈';
    if (category === 'Archives') return '📦';
    if (category === 'Notes') return '📝';
    
    // Fallback to type-based icons
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

  if (!isFirebaseConfigured) {
    return (
      <div className="file-manager">
        <div className="config-error">
          <h3>🔧 Firebase Configuration Required</h3>
          <p>File storage requires Firebase to be properly configured. Please check your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-manager">
      <h2>Student Document Hub</h2>
      
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
        <>
          {/* File Filters */}
          {files.length > 0 && (
            <div className="file-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="category-filter">Category</label>
                  <select 
                    id="category-filter"
                    className="filter-select"
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="tag-filter">Tag</label>
                  <select 
                    id="tag-filter"
                    className="filter-select"
                    value={filters.tag}
                    onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
                  >
                    <option value="">All Tags</option>
                    {tags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="search-filter">Search</label>
                  <input 
                    id="search-filter"
                    type="text"
                    className="filter-input"
                    placeholder="Search files..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="course-filter">Course Code</label>
                  <input 
                    id="course-filter"
                    type="text"
                    className="filter-input"
                    placeholder="e.g., TKT4550"
                    value={filters.courseCode}
                    onChange={(e) => setFilters(prev => ({ ...prev, courseCode: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="filter-actions">
                <button 
                  className="filter-button clear"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
          
          <div className="files-list">
            <h3>Your Files ({filteredFiles.length} of {files.length})</h3>
            {filteredFiles.length === 0 ? (
              <p className="no-files">
                {files.length === 0 ? 'No files uploaded yet.' : 'No files match the current filters.'}
              </p>
            ) : (
              <div className="files-grid">
                {filteredFiles.map(file => (
                  <div key={file.id} className="file-card">
                    <div className="file-info">
                      <span className="file-icon">{getFileIcon(file.type, file.category)}</span>
                      <div className="file-details">
                        <div className="file-enhanced-info">
                          <h4 className="file-name" title={file.name}>{file.name}</h4>
                          {file.category && (
                            <span className={`file-category ${file.category}`}>{file.category}</span>
                          )}
                          {file.courseCode && (
                            <span className="file-course-code">{file.courseCode}</span>
                          )}
                          {file.description && (
                            <p className="file-description">{file.description}</p>
                          )}
                          <p className="file-meta">
                            {formatFileSize(file.size)} • {new Date(file.uploadedAt.toDate()).toLocaleDateString()}
                            {file.subject && ` • ${file.subject}`}
                            {file.semester && ` • ${file.semester}`}
                          </p>
                          {file.tags && file.tags.length > 0 && (
                            <div className="file-tags">
                              {file.tags.map(tag => (
                                <span key={tag} className="file-tag">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
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
        </>
      )}
    </div>
  );
}
