import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCzzFE8f7D3GfZ4f9Czp9q3-IcQCKOZGdk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cabelo-30da4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cabelo-30da4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cabelo-30da4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1044595431880",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1044595431880:web:a00159d8fbe02e4e8d48fd",
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export default app;
