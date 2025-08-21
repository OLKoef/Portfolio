import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration with environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_DATABASE_URL',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];

  console.log('Checking Firebase environment variables...');
  console.log('Available env vars:', requiredKeys.map(key => ({
    key,
    exists: !!process.env[key],
    value: process.env[key] ? `${process.env[key].substring(0, 10)}...` : 'undefined'
  })));

  const missingKeys = requiredKeys.filter(key => !process.env[key]);

  if (missingKeys.length > 0) {
    console.error('Missing Firebase environment variables:', missingKeys);
    console.error('All process.env keys starting with REACT_APP_FIREBASE:',
      Object.keys(process.env).filter(key => key.startsWith('REACT_APP_FIREBASE')));
    return false;
  }

  console.log('✅ All Firebase environment variables are present');
  return true;
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = validateFirebaseConfig();

// Initialize Firebase only if properly configured
let app = null;
let auth = null;
let storage = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    storage = getStorage(app);

    // Initialize Firestore with useFetchStreams: false to prevent ReadableStream locking issues
    db = initializeFirestore(app, {
      useFetchStreams: false
    });

    console.log('✅ Firebase initialized successfully with XHR transport');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('Firebase config being used:', {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing'
    });
  }
} else {
  console.warn('🚫 Firebase not initialized - missing environment variables');
}

export { auth, storage, db };
export default app;
