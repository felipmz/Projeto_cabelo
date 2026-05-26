import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { ClientProfile, ClientFavorites } from '../types';

interface UseClientAuthReturn {
  user: User | null;
  profile: ClientProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateFavorites: (fav: ClientFavorites) => Promise<void>;
  updatePhoto: (photoURL: string) => Promise<void>;
  clearError: () => void;
}

// Firestore client profile lives under a top-level 'clients' collection
const clientRef = (uid: string) => doc(db, 'clients', uid);

export function useClientAuth(): UseClientAuthReturn {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(clientRef(u.uid));
          if (snap.exists()) setProfile(snap.data() as ClientProfile);
        } catch { /* offline */ }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code?.includes('invalid-credential') || code?.includes('wrong-password') || code?.includes('user-not-found')) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro ao entrar. Tente novamente.');
      }
      throw e;
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const profileData: ClientProfile = {
        uid: cred.user.uid,
        displayName: name,
        email,
        phone,
        createdAt: new Date().toISOString(),
      };
      await setDoc(clientRef(cred.user.uid), profileData);
      setProfile(profileData);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') setError('E-mail já em uso.');
      else if (code === 'auth/weak-password')   setError('Senha fraca. Use 6+ caracteres.');
      else                                       setError('Erro ao criar conta.');
      throw e;
    }
  };

  const signOut = async () => { await firebaseSignOut(auth); };

  const updateFavorites = async (fav: ClientFavorites) => {
    if (!user) return;
    await updateDoc(clientRef(user.uid), { favorites: fav });
    setProfile(p => p ? { ...p, favorites: fav } : p);
  };

  const updatePhoto = async (photoURL: string) => {
    if (!user) return;
    await updateDoc(clientRef(user.uid), { photoURL });
    setProfile(p => p ? { ...p, photoURL } : p);
  };

  const clearError = () => setError(null);

  return { user, profile, loading, error, signIn, signUp, signOut, updateFavorites, updatePhoto, clearError };
}
