import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Validate environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Debug: Log what we're getting (only first few chars of API key for security)
if (typeof window !== 'undefined') {
  const apiKeyPreview = requiredEnvVars.apiKey 
    ? `${requiredEnvVars.apiKey.substring(0, 10)}...` 
    : 'NOT SET';
  console.log('🔍 Firebase Config Check:', {
    apiKey: apiKeyPreview,
    authDomain: requiredEnvVars.authDomain || 'NOT SET',
    projectId: requiredEnvVars.projectId || 'NOT SET',
    appId: requiredEnvVars.appId || 'NOT SET'
  });
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`);

if (missingVars.length > 0 && typeof window !== 'undefined') {
  console.error('❌ Missing Firebase environment variables:', missingVars.join(', '));
  console.error('📝 Please create a .env.local file with your Firebase configuration.');
  console.error('📖 See FIREBASE_SETUP.md for instructions.');
}

// Clean API key (remove any quotes or whitespace)
const cleanApiKey = requiredEnvVars.apiKey?.trim().replace(/^["']|["']$/g, '') || '';

const firebaseConfig = {
  apiKey: cleanApiKey || 'demo-api-key',
  authDomain: requiredEnvVars.authDomain || 'demo-project.firebaseapp.com',
  projectId: requiredEnvVars.projectId || 'demo-project',
  storageBucket: requiredEnvVars.storageBucket || 'demo-project.appspot.com',
  messagingSenderId: requiredEnvVars.messagingSenderId || '123456789',
  appId: requiredEnvVars.appId || '1:123456789:web:demo123'
};

// Only initialize if we have a valid API key
let app: ReturnType<typeof initializeApp> | undefined;
let auth: Auth | null = null;

if (cleanApiKey && cleanApiKey !== 'demo-api-key' && cleanApiKey.length > 20) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    if (typeof window !== 'undefined') {
      console.log('✅ Firebase initialized successfully');
    }
  } catch (error: any) {
    console.error('❌ Firebase initialization error:', error);
    if (error.code === 'auth/invalid-api-key') {
      console.error('💡 API Key issue detected. Please check:');
      console.error('   1. API key is correct in .env.local');
      console.error('   2. No quotes around the API key value');
      console.error('   3. API key restrictions in Firebase Console → APIs & Services');
      console.error('   4. Server was restarted after adding .env.local');
    }
    auth = null;
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn('⚠️ Firebase not configured. Please set up your .env.local file.');
    if (!cleanApiKey || cleanApiKey === 'demo-api-key') {
      console.warn('   API Key is missing or invalid');
    }
  }
  auth = null;
}

export { auth };
export default app;

