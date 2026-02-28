// Load environment variables from .env file
// This script reads the .env file and makes variables available to the app
// Note: When using Vite dev server, use vite-env.js instead (loads from import.meta.env)

(async function loadEnv() {
  // Skip if already loaded by vite-env.js with valid values
  if (window.ENV && window.ENV.FIREBASE_API_KEY && window.ENV.FIREBASE_API_KEY !== 'undefined') {
    console.log('✅ Environment already loaded by Vite (skipping .env file load)');
    console.log('📊 Current ENV.FIREBASE_API_KEY:', window.ENV.FIREBASE_API_KEY.substring(0, 10) + '...');
    return;
  }
  
  console.log('⚠️ Vite env not loaded or undefined, attempting .env file load...');
  
  try {
    const response = await fetch('.env');
    const text = await response.text();
    
    window.ENV = window.ENV || {};
    
    text.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        const cleanKey = key.trim();
        
        // Strip VITE_ prefix for compatibility
        const envKey = cleanKey.startsWith('VITE_') 
          ? cleanKey.substring(5) 
          : cleanKey;
        
        window.ENV[envKey] = value;
      }
    });
    
    console.log('✅ Environment variables loaded from .env file');
    console.log('📊 Loaded keys:', Object.keys(window.ENV));
    console.log('📊 FIREBASE_API_KEY:', window.ENV.FIREBASE_API_KEY ? window.ENV.FIREBASE_API_KEY.substring(0, 10) + '...' : 'UNDEFINED');
  } catch (error) {
    console.warn('⚠️ Could not load .env file (this is normal for Vite dev server)');
    console.log('Error:', error.message);
    window.ENV = window.ENV || {};
  }
})();
