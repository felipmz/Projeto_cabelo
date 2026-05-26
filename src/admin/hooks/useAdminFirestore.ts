// ============================================================
// Hooks de CRUD para o painel admin
// ============================================================

import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, setDoc, getDoc, query, where, getDocs,
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { Service, Barber, Appointment, BarberInfo, Testimonial } from '../../types';

const uid = () => auth.currentUser?.uid ?? '';

// ─── Serviços ─────────────────────────────────────────────
export function useAdminServices() {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid()) return;
    const ref = collection(db, 'users', uid(), 'services');
    const unsub = onSnapshot(ref, (snap) => {
      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Service))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setData(items);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const save = async (service: Omit<Service, 'id'> & { id?: string }) => {
    const { id, ...data } = service;
    if (id) {
      await updateDoc(doc(db, 'users', uid(), 'services', id), data);
    } else {
      await addDoc(collection(db, 'users', uid(), 'services'), data);
    }
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, 'users', uid(), 'services', id));
  };

  return { data, loading, save, remove };
}

// ─── Barbeiros ────────────────────────────────────────────
export function useAdminBarbers() {
  const [data, setData] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid()) return;
    const ref = collection(db, 'users', uid(), 'barbers');
    const unsub = onSnapshot(ref, (snap) => {
      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Barber))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setData(items);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const save = async (barber: Omit<Barber, 'id'> & { id?: string }) => {
    const { id, ...data } = barber;
    if (id) {
      await updateDoc(doc(db, 'users', uid(), 'barbers', id), data);
    } else {
      await addDoc(collection(db, 'users', uid(), 'barbers'), data);
    }
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, 'users', uid(), 'barbers', id));
  };

  const toggleAvailability = async (id: string, available: boolean) => {
    await updateDoc(doc(db, 'users', uid(), 'barbers', id), { available });
  };

  return { data, loading, save, remove, toggleAvailability };
}

// ─── Info da barbearia ────────────────────────────────────
export function useAdminBarberInfo() {
  const [data, setData] = useState<BarberInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid()) return;
    const ref = doc(db, 'users', uid(), 'config', 'barberInfo');
    getDoc(ref).then((snap) => {
      if (snap.exists()) setData(snap.data() as BarberInfo);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async (info: BarberInfo) => {
    const ref = doc(db, 'users', uid(), 'config', 'barberInfo');
    await setDoc(ref, info, { merge: true });
    setData(info);
  };

  return { data, loading, save };
}

// ─── Agendamentos ─────────────────────────────────────────
export function useAdminAppointments(date: string) {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid() || !date) return;
    setLoading(true);
    const ref = collection(db, 'users', uid(), 'appointments');
    const q = query(ref, where('date', '==', date));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Appointment))
        .sort((a, b) => a.time.localeCompare(b.time));
      setData(items);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [date]);

  const updateStatus = async (id: string, status: Appointment['status']) => {
    await updateDoc(doc(db, 'users', uid(), 'appointments', id), { status });
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, 'users', uid(), 'appointments', id));
  };

  return { data, loading, updateStatus, remove };
}

// ─── Stats do dia / semana ────────────────────────────────
export async function fetchDayStats(date: string) {
  const id = uid();
  if (!id) return { total: 0, confirmed: 0, revenue: 0, pending: 0 };
  const ref = collection(db, 'users', id, 'appointments');
  const q = query(ref, where('date', '==', date));
  const snap = await getDocs(q);
  const apts = snap.docs.map(d => d.data() as Appointment);
  return {
    total: apts.length,
    confirmed: apts.filter(a => a.status === 'confirmed' || a.status === 'completed').length,
    pending: apts.filter(a => a.status === 'pending').length,
    revenue: apts
      .filter(a => a.status !== 'cancelled')
      .reduce((sum, a) => sum + (a.price ?? 0), 0),
  };
}

// ─── Horários bloqueados ──────────────────────────────────
export interface BlockedSlot {
  id?: string;
  barberId: string;
  date: string;
  time: string;
  reason?: string;
}

export function useAdminBlockedSlots(date: string) {
  const [data, setData] = useState<BlockedSlot[]>([]);

  useEffect(() => {
    if (!uid() || !date) return;
    const ref = collection(db, 'users', uid(), 'blockedSlots');
    const q = query(ref, where('date', '==', date));
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() } as BlockedSlot)));
    });
    return unsub;
  }, [date]);

  const block = async (slot: Omit<BlockedSlot, 'id'>) => {
    await addDoc(collection(db, 'users', uid(), 'blockedSlots'), slot);
  };

  const unblock = async (id: string) => {
    await deleteDoc(doc(db, 'users', uid(), 'blockedSlots', id));
  };

  return { data, block, unblock };
}

// ─── Depoimentos ──────────────────────────────────────────
export function useAdminTestimonials() {
  const [data, setData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid()) return;
    const ref = collection(db, 'users', uid(), 'testimonials');
    const unsub = onSnapshot(ref, (snap) => {
      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Testimonial))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setData(items);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const save = async (t: Omit<Testimonial, 'id'> & { id?: string }) => {
    const { id, ...data } = t;
    if (id) {
      await updateDoc(doc(db, 'users', uid(), 'testimonials', id), data);
    } else {
      await addDoc(collection(db, 'users', uid(), 'testimonials'), data);
    }
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, 'users', uid(), 'testimonials', id));
  };

  return { data, loading, save, remove };
}

// ─── Atualizar foto do barbeiro ────────────────────────────
export async function updateBarberPhoto(barberId: string, photoURL: string): Promise<void> {
  const id = uid();
  if (!id) return;
  await updateDoc(doc(db, 'users', id, 'barbers', barberId), { photoURL });
}

// ─── Atualizar foto do perfil admin (config) ───────────────
export async function updateAdminPhoto(photoURL: string): Promise<void> {
  const id = uid();
  if (!id) return;
  await updateDoc(doc(db, 'users', id, 'config', 'profile'), { photoURL });
  // also update Firebase Auth displayName photo if needed (done via updateProfile elsewhere)
}
