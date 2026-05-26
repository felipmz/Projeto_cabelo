// ============================================================
// Dados padrão (fallback quando Firebase não disponível)
// ============================================================

import { BarberInfo, Service, Barber, Testimonial } from '../types';

export const barberInfo: BarberInfo = {
  name: 'BarberX',
  tagline: 'Precisão. Estilo. Identidade.',
  address: 'Rua das Navalhas, 42 — Centro',
  phone: '(79) 99999-0000',
  whatsapp: '5579999990000',
  email: 'contato@barberx.com',
  instagram: '@barberx',
  openHours: 'Seg–Sáb: 09h–20h',
  about:
    'Fundada em 2018, a BarberX é referência em cortes masculinos modernos e clássicos. Nosso ambiente une tecnologia, conforto e arte — cada detalhe pensado para a sua melhor experiência.',
};

export const services: Service[] = [
  {
    id: 'corte',
    name: 'Corte Clássico',
    description: 'Corte personalizado com acabamento navalha e finalização premium.',
    duration: 40,
    price: 45,
    icon: '✂️',
    order: 1,
  },
  {
    id: 'barba',
    name: 'Barba Completa',
    description: 'Modelagem, hidratação e acabamento com navalha quente.',
    duration: 30,
    price: 35,
    icon: '🪒',
    order: 2,
  },
  {
    id: 'combo',
    name: 'Combo Executivo',
    description: 'Corte + Barba com tratamento capilar incluso.',
    duration: 70,
    price: 75,
    icon: '👑',
    order: 3,
  },
  {
    id: 'sobrancelha',
    name: 'Design de Sobrancelha',
    description: 'Modelagem precisa com linha e navalha.',
    duration: 20,
    price: 20,
    icon: '⚡',
    order: 4,
  },
  {
    id: 'pigmentacao',
    name: 'Pigmentação',
    description: 'Cobertura de falhas na barba com resultado natural.',
    duration: 50,
    price: 60,
    icon: '🎨',
    order: 5,
  },
  {
    id: 'relaxamento',
    name: 'Relaxamento Capilar',
    description: 'Alisamento progressivo com proteção térmica.',
    duration: 90,
    price: 120,
    icon: '💫',
    order: 6,
  },
];

export const barbers: Barber[] = [
  {
    id: 'marcus',
    name: 'Marcus Vinicius',
    specialty: 'Cortes Modernos & Degradê',
    available: true,
    order: 1,
  },
  {
    id: 'rafael',
    name: 'Rafael Souza',
    specialty: 'Barba & Navalha Clássica',
    available: true,
    order: 2,
  },
  {
    id: 'thiago',
    name: 'Thiago Lima',
    specialty: 'Pigmentação & Colorimetria',
    available: true,
    order: 3,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    clientName: 'João Paulo M.',
    text: 'Melhor barbearia da cidade. O Marcus é cirúrgico no degradê, saio toda semana daqui renovado.',
    rating: 5,
    date: '2025-04-10',
    order: 1,
  },
  {
    id: '2',
    clientName: 'André Costa',
    text: 'O ambiente é incrível, parece que você entra num studio de alto padrão. Vale cada centavo.',
    rating: 5,
    date: '2025-03-28',
    order: 2,
  },
  {
    id: '3',
    clientName: 'Felipe R.',
    text: 'Fiz a pigmentação com o Thiago e ficou perfeito. Sistema de agendamento online é muito prático.',
    rating: 5,
    date: '2025-04-02',
    order: 3,
  },
];

// Horários de funcionamento disponíveis
export const availableTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00',
];
