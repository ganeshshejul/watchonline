// Vite environment variable loader
// This module makes Vite env variables available as window.ENV
// Only works when running through Vite dev server or build

if (typeof import.meta !== 'undefined' && import.meta.env) {
  // Running in Vite environment
  console.log('🔍 Vite import.meta.env:', import.meta.env);
  console.log('🔍 VITE_FIREBASE_API_KEY value:', import.meta.env.VITE_FIREBASE_API_KEY);
  console.log('🔍 Type:', typeof import.meta.env.VITE_FIREBASE_API_KEY);
  
  // Strip VITE_ prefix for backward compatibility
  window.ENV = {
    FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  
  console.log('✅ Vite environment variables loaded');
  console.log('📊 ENV keys:', Object.keys(window.ENV));
  console.log('📊 ENV.FIREBASE_API_KEY:', window.ENV.FIREBASE_API_KEY ? window.ENV.FIREBASE_API_KEY.substring(0, 10) + '...' : 'UNDEFINED');
  console.log('📊 Full ENV object:', window.ENV);
}
