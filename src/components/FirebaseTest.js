import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, db } from '../firebase/config';

export default function FirebaseTest() {
  const [testStatus, setTestStatus] = useState('');
  const [testLog, setTestLog] = useState([]);
  const { currentUser } = useAuth();

  const addLog = (message) => {
    console.log(message);
    setTestLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebaseConnection = async () => {
    setTestStatus('testing');
    setTestLog([]);
    
    try {
      addLog('🚀 Starting Firebase connectivity test...');
      
      // Test 1: Check authentication
      addLog(`✅ Auth check: User ${currentUser?.uid ? 'authenticated' : 'not authenticated'}`);
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Test 2: Create minimal test file
      addLog('📝 Creating test file...');
      const testContent = 'Hello Firebase Test';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFileId = `test_${Date.now()}`;
      const storagePath = `user/${currentUser.uid}/${testFileId}`;
      
      addLog(`📍 Storage path: ${storagePath}`);

      // Test 3: Test Storage upload
      addLog('⬆️ Testing Storage upload...');
      const storageRef = ref(storage, storagePath);
      
      // Set a timeout for the upload
      const uploadPromise = uploadBytes(storageRef, testBlob);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Storage upload timeout')), 15000)
      );
      
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      addLog('✅ Storage upload successful');

      // Test 4: Test download URL generation
      addLog('🔗 Testing download URL generation...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      addLog(`✅ Download URL generated: ${downloadURL.substring(0, 50)}...`);

      // Test 5: Test Firestore write
      addLog('💾 Testing Firestore write...');
      const testDoc = {
        name: 'test-file.txt',
        size: testBlob.size,
        contentType: 'text/plain',
        storagePath,
        userId: currentUser.uid,
        createdAt: new Date(),
        status: 'active'
      };

      const docPath = `users/${currentUser.uid}/files/${testFileId}`;
      addLog(`📍 Firestore path: ${docPath}`);
      
      const firestorePromise = setDoc(doc(db, docPath), testDoc);
      const firestoreTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore write timeout')), 15000)
      );
      
      await Promise.race([firestorePromise, firestoreTimeoutPromise]);
      addLog('✅ Firestore write successful');

      addLog('🎉 All tests passed! Firebase is working correctly.');
      setTestStatus('success');

    } catch (error) {
      addLog(`❌ Test failed: ${error.message}`);
      console.error('Firebase test error:', error);
      setTestStatus('error');
    }
  };

  const clearLogs = () => {
    setTestLog([]);
    setTestStatus('');
  };

  return (
    <div style={{ 
      border: '2px solid #007bff', 
      padding: '20px', 
      margin: '20px 0',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>🔧 Firebase Connectivity Test</h3>
      <p>This will test Storage upload and Firestore write operations step by step.</p>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={testFirebaseConnection}
          disabled={testStatus === 'testing'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: testStatus === 'testing' ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {testStatus === 'testing' ? '⏳ Testing...' : '🚀 Run Connectivity Test'}
        </button>
        
        <button 
          onClick={clearLogs}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Logs
        </button>
      </div>

      {testStatus && (
        <div style={{
          padding: '10px',
          borderRadius: '4px',
          backgroundColor: testStatus === 'success' ? '#d4edda' : 
                          testStatus === 'error' ? '#f8d7da' : '#fff3cd',
          border: `1px solid ${testStatus === 'success' ? '#c3e6cb' : 
                               testStatus === 'error' ? '#f5c6cb' : '#ffeaa7'}`
        }}>
          <strong>
            Status: {testStatus === 'success' ? '✅ All tests passed' : 
                     testStatus === 'error' ? '❌ Test failed' : '⏳ Testing...'}
          </strong>
        </div>
      )}

      <div style={{
        marginTop: '15px',
        maxHeight: '300px',
        overflowY: 'auto',
        backgroundColor: '#2d3748',
        color: '#e2e8f0',
        padding: '10px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        <strong>Test Log:</strong>
        {testLog.length === 0 ? (
          <div style={{ fontStyle: 'italic', color: '#a0aec0' }}>No tests run yet</div>
        ) : (
          testLog.map((log, index) => (
            <div key={index} style={{ marginBottom: '2px' }}>{log}</div>
          ))
        )}
      </div>
    </div>
  );
}
