export interface BarberInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  openHours: string;
  about: string;
  photoURL?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  icon: string;
  order?: number;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  photoURL?: string;
  available: boolean;
  order?: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Appointment {
  id?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientId?: string;      // UID Firebase Auth do cliente
  serviceId: string;
  serviceName: string;
  barberId: string;
  barberName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: number;
  duration: number;
  notes?: string;
  createdAt?: string;
  visitorId?: string;
}

export interface ClientProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  createdAt: string;
  favorites?: ClientFavorites;
}

export interface ClientFavorites {
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  preferredTime?: string;
}

export interface Gallery {
  id: string;
  url: string;
  caption?: string;
  order?: number;
}

export interface Testimonial {
  id: string;
  clientName: string;
  text: string;
  rating: number;
  date: string;
  order?: number;
}
