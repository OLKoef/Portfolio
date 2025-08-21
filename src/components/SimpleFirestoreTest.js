import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function SimpleFirestoreTest() {
  const [testLog, setTestLog] = useState([]);
  const [testing, setTesting] = useState(false);
  const { currentUser } = useAuth();

  const addLog = (message) => {
    console.log(message);
    setTestLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirestore = async () => {
    setTesting(true);
    setTestLog([]);
    
    try {
      addLog('🚀 Starting minimal Firestore test...');
      addLog(`👤 Current user: ${currentUser?.uid}`);
      addLog(`🗄️ Firestore instance: ${db ? 'initialized' : 'not initialized'}`);
      addLog(`🏢 Project ID: ${db?.app?.options?.projectId || 'unknown'}`);
      addLog(`🌐 Auth domain: ${db?.app?.options?.authDomain || 'unknown'}`);

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Test 1: Very simple document
      const testData = {
        test: true,
        timestamp: new Date(),
        userId: currentUser.uid
      };

      // Try the same path structure that would work with our rules
      const docRef = doc(db, `users/${currentUser.uid}/files`, `test-${Date.now()}`);
      addLog('📝 Attempting to write simple test document...');
      
      // Direct call with explicit timeout
      const writePromise = setDoc(docRef, testData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Write timeout after 5 seconds')), 5000)
      );
      
      await Promise.race([writePromise, timeoutPromise]);
      addLog('✅ Simple Firestore write successful!');

      // Test 2: Try to read it back
      addLog('📖 Attempting to read document back...');
      const readPromise = getDoc(docRef);
      const readTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Read timeout after 5 seconds')), 5000)
      );
      
      const docSnap = await Promise.race([readPromise, readTimeoutPromise]);
      if (docSnap.exists()) {
        addLog('✅ Document read successfully!');
        addLog(`📄 Data: ${JSON.stringify(docSnap.data())}`);
      } else {
        addLog('❌ Document does not exist');
      }

      addLog('🎉 All Firestore tests passed!');

    } catch (error) {
      addLog(`❌ Firestore test failed: ${error.message}`);
      addLog(`❌ Error code: ${error.code || 'unknown'}`);
      addLog(`❌ Error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ 
      border: '2px solid #ff6b6b', 
      padding: '15px', 
      margin: '15px 0',
      borderRadius: '8px',
      backgroundColor: '#ffe0e0'
    }}>
      <h4>🧪 Simple Firestore Test</h4>
      <p>Testing basic Firestore write/read operations</p>
      
      <button 
        onClick={testFirestore}
        disabled={testing}
        style={{
          padding: '8px 16px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '10px'
        }}
      >
        {testing ? '⏳ Testing...' : '🧪 Test Firestore'}
      </button>

      <div style={{
        backgroundColor: '#2d3748',
        color: '#e2e8f0',
        padding: '10px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '11px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
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
