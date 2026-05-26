import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

export interface AdminProfile {
  displayName: string;
  barberName: string;  // nome da barbearia
  email: string;
  createdAt: string;
}

interface UseAuthReturn {
  user: User | null;
  profile: AdminProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, barberName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Carrega perfil do Firestore
        try {
          const snap = await getDoc(doc(db, 'users', u.uid, 'config', 'profile'));
          if (snap.exists()) setProfile(snap.data() as AdminProfile);
        } catch { /* sem conexão — ignora */ }
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
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('E-mail ou senha incorretos.');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
      throw e;
    }
  };

  const signUp = async (email: string, password: string, displayName: string, barberName: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });

      // Salva perfil + configura barbearia padrão
      const profileData: AdminProfile = {
        displayName,
        barberName,
        email,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', cred.user.uid, 'config', 'profile'), profileData);

      // Cria info inicial da barbearia
      await setDoc(doc(db, 'users', cred.user.uid, 'config', 'barberInfo'), {
        name: barberName,
        tagline: 'Precisão. Estilo. Identidade.',
        address: '',
        phone: '',
        whatsapp: '',
        email,
        instagram: '',
        openHours: 'Seg–Sáb: 09h–20h',
        about: '',
      });

      setProfile(profileData);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (code === 'auth/weak-password') {
        setError('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else if (code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
      throw e;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch {
      setError('Não foi possível enviar o e-mail de recuperação.');
      throw new Error('reset failed');
    }
  };

  const clearError = () => setError(null);

  return { user, profile, loading, error, signIn, signUp, signOut, resetPassword, clearError };
}
