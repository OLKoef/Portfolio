import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadService } from '../services/fileUpload';
import { isFirebaseConfigured } from '../firebase/config';

export default function FileUploadDebug({ onUploadSuccess, onUploadError }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const { currentUser } = useAuth();

  const handleFileUpload = async (files) => {
    console.log('🚀 DEBUG: Starting upload for', files.length, 'files');
    console.log('🔍 DEBUG: Firebase configured:', isFirebaseConfigured);
    console.log('🔍 DEBUG: Current user:', currentUser?.uid);

    if (!isFirebaseConfigured) {
      console.error('❌ DEBUG: Firebase not configured');
      onUploadError?.('Firebase er ikke konfigurert riktig');
      return;
    }

    if (!currentUser) {
      console.error('❌ DEBUG: No current user');
      onUploadError?.('Du må være logget inn');
      return;
    }

    console.log('✅ DEBUG: Prerequisites met, starting upload...');
    setUploading(true);
    setUploadProgress(0);

    // Add a timeout to catch hanging uploads
    const uploadTimeout = setTimeout(() => {
      console.error('⏰ DEBUG: Upload timeout after 30 seconds');
      setUploading(false);
      setUploadProgress(0);
      onUploadError?.('Upload timeout - operasjonen tok for lang tid');
    }, 30000);

    try {
      const results = [];
      const errors = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 DEBUG: Uploading file ${i + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

        try {
          const progressBefore = Math.round((i / files.length) * 90);
          console.log(`📊 DEBUG: Setting progress to ${progressBefore}%`);
          setUploadProgress(progressBefore);

          console.log('🔄 DEBUG: Calling FileUploadService.uploadFile...');
          const result = await FileUploadService.uploadFile(
            file,
            currentUser.uid,
            null // no org
          );

          console.log('✅ DEBUG: Upload successful:', result);
          results.push(result);

          const progressAfter = Math.round(((i + 1) / files.length) * 90);
          console.log(`📊 DEBUG: Setting progress to ${progressAfter}%`);
          setUploadProgress(progressAfter);

        } catch (error) {
          console.error('❌ DEBUG: Upload failed:', error);
          errors.push(`${file.name}: ${error.message}`);
        }
      }

      setUploadProgress(100);
      console.log('📊 DEBUG: Final results:', results.length, 'successful,', errors.length, 'errors');

      if (results.length > 0) {
        console.log('🎉 DEBUG: Showing success state');
        setShowSuccess(true);
        onUploadSuccess?.(results);
        
        setTimeout(() => {
          console.log('🔄 DEBUG: Hiding success state');
          setShowSuccess(false);
          setUploading(false);
          setUploadProgress(0);
        }, 5000);
      } else {
        console.log('❌ DEBUG: No successful uploads');
        setUploading(false);
        setUploadProgress(0);
      }

      if (errors.length > 0) {
        console.log('⚠️ DEBUG: Some errors occurred:', errors);
        onUploadError?.(`Noen filer feilet: ${errors.join(', ')}`);
      }

    } catch (error) {
      console.error('❌ DEBUG: General upload error:', error);
      onUploadError?.(error.message);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div style={{ border: '2px dashed #ccc', padding: '20px', margin: '20px 0' }}>
      <h3>��� Debug File Upload</h3>
      
      {!uploading && !showSuccess && (
        <div>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
          />
          <p>Select files to test upload functionality</p>
        </div>
      )}

      {uploading && (
        <div>
          <p>Uploading... {uploadProgress}%</p>
          <div style={{ 
            width: '100%', 
            height: '20px', 
            backgroundColor: '#f0f0f0',
            borderRadius: '10px'
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              borderRadius: '10px',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )}

      {showSuccess && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #c3e6cb'
        }}>
          <h4>✅ Upload Successful!</h4>
          <p>Files have been uploaded successfully. Check console for details.</p>
        </div>
      )}
    </div>
  );
}
