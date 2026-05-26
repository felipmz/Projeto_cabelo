import React, { useState, useEffect } from 'react';
import { useFirestoreServices, useFirestoreBarbers, getAppointmentsByDate, createAppointment } from '../../hooks/useFirestore';
import { useClientAuth } from '../../hooks/useClientAuth';
import { useClientAuthModal } from '../ui/ClientAuthModal';
import { Appointment, Service, Barber } from '../../types';
import { availableTimeSlots } from '../../data';
import styles from './Booking.module.css';
import AIAssistant from '../ui/AIAssistant';

type Step = 'service' | 'barber' | 'datetime' | 'info' | 'confirm' | 'done';

interface BookingState {
  service: Service | null;
  barber: Barber | null;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
}

const today = () => new Date().toISOString().split('T')[0];
const formatDate = (d: string) => { if (!d) return ''; const [y,m,dt] = d.split('-'); return `${dt}/${m}/${y}`; };

const STEP_LABELS: Record<Step, string> = {
  service:'01 — Serviço', barber:'02 — Barbeiro', datetime:'03 — Data & Hora',
  info:'04 — Seus Dados', confirm:'05 — Confirmar', done:'Concluído',
};
const STEPS: Step[] = ['service','barber','datetime','info','confirm','done'];

const Booking: React.FC = () => {
  const { data: services } = useFirestoreServices();
  const { data: barbers }  = useFirestoreBarbers();
  const { user, profile }  = useClientAuth();
  const { openModal }      = useClientAuthModal();

  const [step, setStep]             = useState<Step>('service');
  const [booking, setBooking]       = useState<BookingState>({
    service: null, barber: null, date: today(), time: '',
    clientName: '', clientPhone: '', clientEmail: '', notes: '',
  });
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loading, setLoading]       = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [favWarning, setFavWarning] = useState(false);

  // Pre-fill from client profile
  useEffect(() => {
    if (!profile) return;
    setBooking(prev => ({
      ...prev,
      clientName:  prev.clientName  || profile.displayName || '',
      clientPhone: prev.clientPhone || profile.phone       || '',
      clientEmail: prev.clientEmail || profile.email       || '',
    }));
  }, [profile]);

  // Pre-fill favorites when services/barbers are loaded
  useEffect(() => {
    if (!profile?.favorites || !services.length || !barbers.length) return;
    const fav = profile.favorites;
    const favSvc    = services.find(s => s.id === fav.serviceId) ?? null;
    const favBarber = barbers.find(b  => b.id === fav.barberId)  ?? null;
    setBooking(prev => ({
      ...prev,
      service: prev.service ?? favSvc,
      barber:  prev.barber  ?? favBarber,
      time:    prev.time    || fav.preferredTime || '',
    }));
    if (favBarber && !favBarber.available) setFavWarning(true);
  }, [profile, services, barbers]);

  // Load taken slots
  useEffect(() => {
    if (!booking.date || !booking.barber) return;
    getAppointmentsByDate(booking.date).then(apts => {
      const taken = apts.filter(a => a.barberId === booking.barber?.id).map(a => a.time);
      setTakenSlots(taken);
    });
  }, [booking.date, booking.barber]);

  const setField = <K extends keyof BookingState>(k: K, v: BookingState[K]) =>
    setBooking(prev => ({ ...prev, [k]: v }));

  const next = () => { const i = STEPS.indexOf(step); if (i < STEPS.length - 1) setStep(STEPS[i+1]); };
  const prev = () => { const i = STEPS.indexOf(step); if (i > 0) setStep(STEPS[i-1]); };

  const handleConfirm = async () => {
    if (!booking.service || !booking.barber) return;
    setLoading(true);
    const apt: Omit<Appointment,'id'> = {
      clientName: booking.clientName, clientPhone: booking.clientPhone,
      clientEmail: booking.clientEmail, clientId: user?.uid,
      serviceId: booking.service.id, serviceName: booking.service.name,
      barberId: booking.barber.id,   barberName: booking.barber.name,
      date: booking.date, time: booking.time, status: 'pending',
      price: booking.service.price,  duration: booking.service.duration,
      notes: booking.notes,
    };
    const id = await createAppointment(apt);
    setAppointmentId(id);
    setLoading(false);
    setStep('done');
  };

  const stepIdx  = STEPS.indexOf(step);
  const progress = (stepIdx / (STEPS.length - 1)) * 100;

  return (
    <section id="book" className={styles.section}>
      <div className={styles.header}>
        <div className="section-label">◻ Agendamento</div>
        <h2 className={styles.title}>AGENDE SEU<br/><span>HORÁRIO</span></h2>
      </div>

      {/* Client login nudge */}
      {!user && (
        <div className={styles.loginNudge}>
          <span>★</span>
          <span>Entre para pré-preencher seus dados e salvar favoritos.</span>
          <button className={styles.nudgeBtn} onClick={() => openModal('login')}>Entrar / Cadastrar</button>
        </div>
      )}

      {/* Favorites prefill banner */}
      {user && profile?.favorites && step === 'service' && (
        <div className={`${styles.favBanner} ${favWarning ? styles.favBannerWarn : ''}`}>
          <span>★</span>
          <span>
            Favoritos carregados: <strong>{profile.favorites.serviceName}</strong> com <strong>{profile.favorites.barberName}</strong>
            {favWarning && ' — Barbeiro indisponível hoje. Escolha outro.'}
          </span>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.formPanel}>
          {/* Progress bar */}
          <div className={styles.progress}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>

          {step !== 'done' && (
            <div className={styles.stepIndicator}>
              {STEPS.filter(s => s !== 'done').map((s, i) => (
                <div key={s} className={`${styles.stepDot} ${s === step ? styles.stepActive : ''} ${STEPS.indexOf(s) < stepIdx ? styles.stepDone : ''}`}>
                  <span>{i + 1}</span>
                  <div className={styles.stepLabel}>{STEP_LABELS[s].split(' — ')[1]}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Step: Service ── */}
          {step === 'service' && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Escolha o Serviço</h3>
              <div className={styles.serviceGrid}>
                {services.map(s => (
                  <button key={s.id}
                    className={`${styles.serviceOption} ${booking.service?.id === s.id ? styles.selected : ''}`}
                    onClick={() => setField('service', s)}>
                    <span className={styles.serviceIcon}>{s.icon}</span>
                    <div className={styles.serviceInfo}>
                      <div className={styles.serviceName}>{s.name}</div>
                      <div className={styles.serviceMeta}>{s.duration}min · R$ {s.price.toFixed(2).replace('.',',')}</div>
                    </div>
                    {booking.service?.id === s.id && <span className={styles.checkmark}>✓</span>}
                    {profile?.favorites?.serviceId === s.id && <span className={styles.favStar}>★</span>}
                  </button>
                ))}
              </div>
              <button className="btn-gold" disabled={!booking.service} onClick={next}>Continuar →</button>
            </div>
          )}

          {/* ── Step: Barber ── */}
          {step === 'barber' && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Escolha o Barbeiro</h3>
              <div className={styles.barberGrid}>
                {barbers.filter(b => b.available).map(b => (
                  <button key={b.id}
                    className={`${styles.barberOption} ${booking.barber?.id === b.id ? styles.selected : ''}`}
                    onClick={() => setField('barber', b)}>
                    <div className={styles.barberAvatar}>
                      {b.photoURL
                        ? <img src={b.photoURL} alt={b.name} className={styles.barberPhoto} />
                        : b.name.split(' ').map(n => n[0]).join('').slice(0,2)
                      }
                    </div>
                    <div>
                      <div className={styles.barberName}>{b.name}</div>
                      <div className={styles.barberSpec}>{b.specialty}</div>
                    </div>
                    {profile?.favorites?.barberId === b.id && <span className={styles.favStar}>★</span>}
                    {booking.barber?.id === b.id && <span className={styles.checkmark}>✓</span>}
                  </button>
                ))}
                {barbers.filter(b => !b.available).length > 0 && (
                  <div className={styles.unavailNote}>
                    {barbers.filter(b => !b.available).map(b => b.name).join(', ')} — indisponível hoje
                  </div>
                )}
              </div>
              <div className={styles.navButtons}>
                <button className="btn-outline" onClick={prev}>← Voltar</button>
                <button className="btn-gold" disabled={!booking.barber} onClick={next}>Continuar →</button>
              </div>
            </div>
          )}

          {/* ── Step: DateTime ── */}
          {step === 'datetime' && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Data & Horário</h3>
              <label className={styles.label}>Data</label>
              <input type="date" className={styles.input} value={booking.date} min={today()}
                onChange={e => setField('date', e.target.value)} />
              <label className={styles.label} style={{ marginTop: 20 }}>Horário disponível</label>
              <div className={styles.timeGrid}>
                {availableTimeSlots.map(slot => {
                  const isTaken = takenSlots.includes(slot);
                  const isFav   = profile?.favorites?.preferredTime === slot;
                  return (
                    <button key={slot}
                      className={`${styles.timeSlot} ${booking.time === slot ? styles.selected : ''} ${isTaken ? styles.taken : ''} ${isFav && !isTaken ? styles.favSlot : ''}`}
                      disabled={isTaken} onClick={() => setField('time', slot)}
                      title={isFav ? 'Horário favorito' : undefined}>
                      {slot}{isFav && !isTaken ? ' ★' : ''}
                    </button>
                  );
                })}
              </div>
              <div className={styles.navButtons}>
                <button className="btn-outline" onClick={prev}>← Voltar</button>
                <button className="btn-gold" disabled={!booking.date || !booking.time} onClick={next}>Continuar →</button>
              </div>
            </div>
          )}

          {/* ── Step: Info ── */}
          {step === 'info' && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Seus Dados</h3>
              <label className={styles.label}>Nome completo *</label>
              <input type="text" className={styles.input} placeholder="Ex: João Silva"
                value={booking.clientName} onChange={e => setField('clientName', e.target.value)} />
              <label className={styles.label} style={{ marginTop: 16 }}>WhatsApp *</label>
              <input type="tel" className={styles.input} placeholder="(00) 00000-0000"
                value={booking.clientPhone} onChange={e => setField('clientPhone', e.target.value)} />
              <label className={styles.label} style={{ marginTop: 16 }}>E-mail (opcional)</label>
              <input type="email" className={styles.input} placeholder="seu@email.com"
                value={booking.clientEmail} onChange={e => setField('clientEmail', e.target.value)} />
              <label className={styles.label} style={{ marginTop: 16 }}>Observações</label>
              <textarea className={styles.textarea} placeholder="Alguma preferência?"
                value={booking.notes} onChange={e => setField('notes', e.target.value)} />
              <div className={styles.navButtons}>
                <button className="btn-outline" onClick={prev}>← Voltar</button>
                <button className="btn-gold" disabled={!booking.clientName || !booking.clientPhone} onClick={next}>Revisar →</button>
              </div>
            </div>
          )}

          {/* ── Step: Confirm ── */}
          {step === 'confirm' && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Confirmar</h3>
              <div className={styles.summary}>
                {[
                  ['Serviço',  booking.service?.name],
                  ['Barbeiro', booking.barber?.name],
                  ['Data',     formatDate(booking.date)],
                  ['Horário',  booking.time],
                  ['Duração',  `${booking.service?.duration} min`],
                  ['Cliente',  booking.clientName],
                ].map(([l, v]) => (
                  <div key={l} className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{l}</span>
                    <span className={styles.summaryValue}>{v}</span>
                  </div>
                ))}
                <div className={styles.summaryDivider} />
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Total</span>
                  <span className={styles.summaryTotal}>R$ {booking.service?.price.toFixed(2).replace('.',',')}</span>
                </div>
              </div>
              <div className={styles.navButtons}>
                <button className="btn-outline" onClick={prev}>← Editar</button>
                <button className="btn-gold" disabled={loading} onClick={handleConfirm}>
                  {loading ? 'Confirmando...' : 'Confirmar ✓'}
                </button>
              </div>
            </div>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <div className={styles.doneStep}>
              <div className={styles.doneIcon}>✓</div>
              <h3 className={styles.doneTitle}>Agendamento Confirmado!</h3>
              <p className={styles.doneText}>
                Seu horário foi reservado. Entraremos em contato via WhatsApp para confirmar.
              </p>
              <div className={styles.doneCode}>
                <span className={styles.doneCodeLabel}>Código</span>
                <span className={styles.doneCodeValue}>{appointmentId?.toUpperCase().slice(-8) ?? 'BARBERX01'}</span>
              </div>
              {!user && (
                <button className="btn-outline" style={{ marginBottom: 8 }} onClick={() => openModal('register')}>
                  Criar conta para acompanhar
                </button>
              )}
              <button className="btn-gold" onClick={() => {
                setStep('service');
                setBooking({ service: null, barber: null, date: today(), time: '', clientName: '', clientPhone: '', clientEmail: '', notes: '' });
                setFavWarning(false);
              }}>Novo Agendamento</button>
            </div>
          )}
        </div>

        <div className={styles.aiPanel}><AIAssistant bookingContext={booking} /></div>
      </div>
    </section>
  );
};

export default Booking;
