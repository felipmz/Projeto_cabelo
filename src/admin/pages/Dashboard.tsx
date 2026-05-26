import React, { useEffect, useState } from 'react';
import { fetchDayStats } from '../hooks/useAdminFirestore';
import { useAdminAppointments } from '../hooks/useAdminFirestore';
import s from './Dashboard.module.css';

const today = () => new Date().toISOString().split('T')[0];
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

interface Stats { total: number; confirmed: number; pending: number; revenue: number; }

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído', cancelled: 'Cancelado',
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, confirmed: 0, pending: 0, revenue: 0 });
  const { data: appointments, loading, updateStatus } = useAdminAppointments(today());
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchDayStats(today()).then(setStats);
  }, [appointments]);

  const handleStatus = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    setUpdating(id);
    await updateStatus(id, status);
    setUpdating(null);
  };

  const STAT_CARDS = [
    { label: 'Agendamentos hoje', value: stats.total, icon: '◻', color: 'var(--blue)' },
    { label: 'Confirmados',       value: stats.confirmed, icon: '✓', color: 'var(--green)' },
    { label: 'Pendentes',         value: stats.pending, icon: '◷', color: 'var(--orange)' },
    { label: 'Receita estimada',  value: `R$ ${stats.revenue.toFixed(2).replace('.', ',')}`, icon: '◆', color: 'var(--gold)' },
  ];

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageLabel}>◈ DASHBOARD</div>
          <h1 className={s.pageTitle}>Visão Geral</h1>
        </div>
        <div className={s.dateChip}>{fmtDate(today())}</div>
      </div>

      {/* Stat cards */}
      <div className={s.statGrid}>
        {STAT_CARDS.map((card, i) => (
          <div key={i} className={s.statCard} style={{ '--accent': card.color } as React.CSSProperties}>
            <div className={s.statIcon}>{card.icon}</div>
            <div className={s.statValue}>{card.value}</div>
            <div className={s.statLabel}>{card.label}</div>
            <div className={s.statBar} />
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <div className={s.section}>
        <div className={s.sectionHeader}>
          <span className={s.sectionTitle}>Agenda de hoje</span>
          <span className={s.sectionCount}>{appointments.length} horários</span>
        </div>

        {loading ? (
          <div className={s.skels}>
            {[1,2,3].map(i => <div key={i} className={`skel ${s.skel}`} />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">◻</div>
            <div>Nenhum agendamento para hoje</div>
          </div>
        ) : (
          <div className={s.aptList}>
            {appointments.map(apt => (
              <div key={apt.id} className={`${s.aptCard} ${s[`apt_${apt.status}`]}`}>
                <div className={s.aptTime}>
                  <span className={s.aptTimeVal}>{apt.time}</span>
                  <span className={s.aptDur}>{apt.duration}min</span>
                </div>
                <div className={s.aptInfo}>
                  <div className={s.aptClient}>{apt.clientName}</div>
                  <div className={s.aptMeta}>{apt.serviceName} · {apt.barberName}</div>
                  {apt.notes && <div className={s.aptNotes}>"{apt.notes}"</div>}
                </div>
                <div className={s.aptRight}>
                  <div className={s.aptPrice}>R$ {apt.price.toFixed(2).replace('.', ',')}</div>
                  <span className={`tag tag-${apt.status}`}>{STATUS_LABEL[apt.status]}</span>
                  {apt.status === 'pending' && (
                    <div className={s.aptActions}>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--green-dim)', border: '1px solid rgba(45,206,137,0.3)', color: 'var(--green)' }}
                        disabled={updating === apt.id}
                        onClick={() => handleStatus(apt.id!, 'confirmed')}
                      >✓ Confirmar</button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={updating === apt.id}
                        onClick={() => handleStatus(apt.id!, 'cancelled')}
                      >✕</button>
                    </div>
                  )}
                  {apt.status === 'confirmed' && (
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--blue-dim)', border: '1px solid rgba(94,114,228,0.3)', color: 'var(--blue)' }}
                      disabled={updating === apt.id}
                      onClick={() => handleStatus(apt.id!, 'completed')}
                    >Concluir</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
