import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB-c_55wHpLeY9YwpCMhtOq9AbB92nUNcM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "portfolio-admin-c953e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "portfolio-admin-c953e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "portfolio-admin-c953e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "232388931565",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:232388931565:web:891f7490678cb1fffc81e4",
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export default app;
