// Firebase configuration loaded from environment variables
// Works with both Vite (import.meta.env) and non-Vite environments (window.ENV)

const firebaseConfig = {
  apiKey: window.ENV?.FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: window.ENV?.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: window.ENV?.FIREBASE_APP_ID || 'YOUR_APP_ID',
};

export default firebaseConfig;
