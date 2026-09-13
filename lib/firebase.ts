import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is provided
const isConfigured = !!firebaseConfig.apiKey;
const app = isConfigured ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
const db = app ? getFirestore(app) : null as any;
const auth = app ? getAuth(app) : null as any;

export { app, db, auth };
