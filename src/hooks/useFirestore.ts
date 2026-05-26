// ============================================================
// Hooks para Firestore — Barbearia
// Inclui fallback para dados mockados caso Firebase não disponível
// ============================================================

import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Service, Barber, Testimonial, BarberInfo, Appointment,
} from '../types';
import {
  services as defaultServices,
  barbers as defaultBarbers,
  testimonials as defaultTestimonials,
  barberInfo as defaultBarberInfo,
} from '../data';

const ADMIN_USER_ID = import.meta.env.VITE_ADMIN_USER_ID || '';
const FIREBASE_TIMEOUT_MS = 6000;

interface UseFirestoreReturn<T> {
  data: T;
  loading: boolean;
}

// ─── Serviços ─────────────────────────────────────────────
export function useFirestoreServices(): UseFirestoreReturn<Service[]> {
  const [data, setData] = useState<Service[]>(defaultServices);
  const [loading, setLoading] = useState(!!ADMIN_USER_ID);

  useEffect(() => {
    if (!ADMIN_USER_ID) return;

    const timeoutId = setTimeout(() => {
      setData(d => d.length === 0 ? defaultServices : d);
      setLoading(false);
    }, FIREBASE_TIMEOUT_MS);

    const ref = collection(db, 'users', ADMIN_USER_ID, 'services');
    const unsub = onSnapshot(ref, (snap) => {
      clearTimeout(timeoutId);
      if (snap.empty) {
        setData(defaultServices);
      } else {
        const items = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Service))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setData(items.length > 0 ? items : defaultServices);
      }
      setLoading(false);
    }, () => { clearTimeout(timeoutId); setData(defaultServices); setLoading(false); });

    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  return { data, loading };
}

// ─── Barbeiros ────────────────────────────────────────────
export function useFirestoreBarbers(): UseFirestoreReturn<Barber[]> {
  const [data, setData] = useState<Barber[]>(defaultBarbers);
  const [loading, setLoading] = useState(!!ADMIN_USER_ID);

  useEffect(() => {
    if (!ADMIN_USER_ID) return;

    const timeoutId = setTimeout(() => {
      setData(d => d.length === 0 ? defaultBarbers : d);
      setLoading(false);
    }, FIREBASE_TIMEOUT_MS);

    const ref = collection(db, 'users', ADMIN_USER_ID, 'barbers');
    const unsub = onSnapshot(ref, (snap) => {
      clearTimeout(timeoutId);
      if (snap.empty) {
        setData(defaultBarbers);
      } else {
        const items = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Barber))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setData(items.length > 0 ? items : defaultBarbers);
      }
      setLoading(false);
    }, () => { clearTimeout(timeoutId); setData(defaultBarbers); setLoading(false); });

    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  return { data, loading };
}

// ─── Info da barbearia ────────────────────────────────────
export function useFirestoreBarberInfo(): UseFirestoreReturn<BarberInfo> {
  const [data, setData] = useState<BarberInfo>(defaultBarberInfo);
  const [loading, setLoading] = useState(!!ADMIN_USER_ID);

  useEffect(() => {
    if (!ADMIN_USER_ID) return;

    const timeoutId = setTimeout(() => { setLoading(false); }, FIREBASE_TIMEOUT_MS);

    const ref = doc(db, 'users', ADMIN_USER_ID, 'config', 'barberInfo');
    getDoc(ref).then((snap) => {
      clearTimeout(timeoutId);
      if (snap.exists()) setData(snap.data() as BarberInfo);
      setLoading(false);
    }).catch(() => { clearTimeout(timeoutId); setLoading(false); });

    return () => clearTimeout(timeoutId);
  }, []);

  return { data, loading };
}

// ─── Depoimentos ──────────────────────────────────────────
export function useFirestoreTestimonials(): UseFirestoreReturn<Testimonial[]> {
  const [data, setData] = useState<Testimonial[]>(defaultTestimonials);
  const [loading, setLoading] = useState(!!ADMIN_USER_ID);

  useEffect(() => {
    if (!ADMIN_USER_ID) return;

    const timeoutId = setTimeout(() => {
      setData(d => d.length === 0 ? defaultTestimonials : d);
      setLoading(false);
    }, FIREBASE_TIMEOUT_MS);

    const ref = collection(db, 'users', ADMIN_USER_ID, 'testimonials');
    const unsub = onSnapshot(ref, (snap) => {
      clearTimeout(timeoutId);
      if (snap.empty) {
        setData(defaultTestimonials);
      } else {
        const items = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Testimonial))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setData(items.length > 0 ? items : defaultTestimonials);
      }
      setLoading(false);
    }, () => { clearTimeout(timeoutId); setData(defaultTestimonials); setLoading(false); });

    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  return { data, loading };
}

// ─── Agendamentos (consulta por data) ─────────────────────
export async function getAppointmentsByDate(date: string): Promise<Appointment[]> {
  if (!ADMIN_USER_ID) return [];
  try {
    const ref = collection(db, 'users', ADMIN_USER_ID, 'appointments');
    const q = query(ref, where('date', '==', date), where('status', '!=', 'cancelled'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
  } catch {
    return [];
  }
}

// ─── Criar agendamento ─────────────────────────────────────
export async function createAppointment(appointment: Omit<Appointment, 'id'>): Promise<string | null> {
  if (!ADMIN_USER_ID) {
    // Sem Firebase — simula sucesso
    return 'mock-' + Date.now();
  }
  try {
    const ref = collection(db, 'users', ADMIN_USER_ID, 'appointments');
    const docRef = await addDoc(ref, {
      ...appointment,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (e) {
    console.error('Erro ao criar agendamento:', e);
    return null;
  }
}
