import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - directly using your credentials
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB1M3VyLxHCLX5sZOsK1M-h4O5EkU2jFOM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fast-connect-58826.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fast-connect-58826",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fast-connect-58826.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "233127658099",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:233127658099:web:fc225a5a23b2ccf313e006"
};

// Debug: Log config on client side
if (typeof window !== 'undefined') {
  console.log('🔍 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKeyLength: firebaseConfig.apiKey?.length
  });
}

// Initialize Firebase
let app;
let auth: Auth;
let db: ReturnType<typeof getFirestore>;
let storage: ReturnType<typeof getStorage>;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  if (typeof window !== 'undefined') {
    console.log('✅ Firebase initialized successfully!');
    console.log('   Project:', firebaseConfig.projectId);
  }
} catch (error: any) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

export { auth, db, storage };
export default app;

