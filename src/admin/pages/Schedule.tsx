import React, { useState } from 'react';
import { useAdminBlockedSlots, useAdminAppointments } from '../hooks/useAdminFirestore';
import { useAdminBarbers, useAdminServices } from '../hooks/useAdminFirestore';
import { Appointment } from '../../types';
import Toast from '../components/ui/Toast';
import s from './Schedule.module.css';

const today = () => new Date().toISOString().split('T')[0];

// Gera todos os slots de 30 em 30 min entre openTime e closeTime
function generateSlots(openTime: string, closeTime: string, intervalMin: number): string[] {
  const slots: string[] = [];
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  let total = oh * 60 + om;
  const end   = ch * 60 + cm;
  while (total < end) {
    const h = String(Math.floor(total / 60)).padStart(2, '0');
    const m = String(total % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    total += intervalMin;
  }
  return slots;
}

// Quantos slots ocupa um serviço de `duration` minutos
function slotsOccupied(duration: number, interval: number) {
  return Math.ceil(duration / interval);
}

// Horários que um agendamento ocupa (início + subsequentes pela duração)
function occupiedTimes(startTime: string, duration: number, interval: number, allSlots: string[]): string[] {
  const count = slotsOccupied(duration, interval);
  const idx = allSlots.indexOf(startTime);
  if (idx === -1) return [startTime];
  return allSlots.slice(idx, idx + count);
}

type SlotStatus = 'free' | 'occupied' | 'blocked' | 'continuation';

interface SlotInfo {
  status: SlotStatus;
  appointment?: Appointment;
  isStart?: boolean;
  span?: number;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído', cancelled: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'var(--orange)', confirmed: 'var(--blue)', completed: 'var(--green)', cancelled: 'var(--red)',
};

const Schedule: React.FC = () => {
  const [date, setDate]           = useState(today());
  const [openTime, setOpenTime]   = useState('09:00');
  const [closeTime, setCloseTime] = useState('20:00');
  const [interval, setInterval]   = useState(30); // minutos por slot

  const { data: barbers }                     = useAdminBarbers();
  const { data: services }                    = useAdminServices();
  const { data: blocked, block, unblock }     = useAdminBlockedSlots(date);
  const { data: appointments, updateStatus, remove: removeApt } = useAdminAppointments(date);

  const [selectedApt, setSelectedApt]   = useState<Appointment | null>(null);
  const [blockReason, setBlockReason]   = useState('');
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [processing, setProcessing]     = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const slots = generateSlots(openTime, closeTime, interval);

  // Quick date navigation
  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i - 2);
    return d.toISOString().split('T')[0];
  });

  // Build slot map per barber
  const getSlotInfo = (barberId: string, time: string): SlotInfo => {
    // Bloqueado?
    const bl = blocked.find(b => b.barberId === barberId && b.time === time);
    if (bl) return { status: 'blocked' };

    // Ocupado por agendamento?
    const apt = appointments.find(a =>
      a.barberId === barberId &&
      a.status !== 'cancelled' &&
      occupiedTimes(a.time, a.duration, interval, slots).includes(time)
    );
    if (apt) {
      const isStart = apt.time === time;
      const span = slotsOccupied(apt.duration, interval);
      return {
        status: isStart ? 'occupied' : 'continuation',
        appointment: apt,
        isStart,
        span,
      };
    }

    return { status: 'free' };
  };

  const handleSlotClick = async (barberId: string, barberName: string, time: string) => {
    const info = getSlotInfo(barberId, time);
    if (info.status === 'continuation') return; // ignora cliques em slots de continuação

    if (info.status === 'occupied' && info.appointment) {
      setSelectedApt(info.appointment);
      return;
    }

    if (info.status === 'blocked') {
      const bl = blocked.find(b => b.barberId === barberId && b.time === time);
      if (bl?.id) {
        setProcessing(`${barberId}-${time}`);
        await unblock(bl.id);
        setProcessing(null);
        setToast({ msg: `${time} liberado para ${barberName}`, type: 'success' });
      }
      return;
    }

    // Livre → bloquear
    setProcessing(`${barberId}-${time}`);
    await block({ barberId, date, time, reason: blockReason });
    setProcessing(null);
    setToast({ msg: `${time} bloqueado para ${barberName}`, type: 'success' });
  };

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    await updateStatus(id, status);
    setSelectedApt(prev => prev ? { ...prev, status } : prev);
    setToast({ msg: `Status → ${STATUS_LABEL[status]}`, type: 'success' });
  };

  const handleRemoveApt = async (id: string) => {
    if (!confirm('Remover este agendamento?')) return;
    await removeApt(id);
    setSelectedApt(null);
    setToast({ msg: 'Agendamento removido.', type: 'success' });
  };

  const freeCount = (barberId: string) =>
    slots.filter(t => getSlotInfo(barberId, t).status === 'free').length;

  const occupiedCount = (barberId: string) =>
    slots.filter(t => getSlotInfo(barberId, t).status === 'occupied').length;

  const blockedCount = (barberId: string) =>
    slots.filter(t => getSlotInfo(barberId, t).status === 'blocked').length;

  return (
    <div className={s.page}>
      {/* ── Header ── */}
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageLabel}>◷ GRADE DE HORÁRIOS</div>
          <h1 className={s.pageTitle}>Agenda Visual</h1>
        </div>
        <button className={`btn btn-ghost ${s.settingsBtn}`} onClick={() => setShowSettings(v => !v)}>
          ⚙ Configurações
        </button>
      </div>

      {/* ── Settings panel ── */}
      {showSettings && (
        <div className={s.settingsPanel}>
          <div className={s.settingsTitle}>Configurações da Grade</div>
          <div className={s.settingsRow}>
            <div className="field">
              <label className="label">Abertura</label>
              <input type="time" className={`input ${s.timeInput}`} value={openTime}
                onChange={e => setOpenTime(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Fechamento</label>
              <input type="time" className={`input ${s.timeInput}`} value={closeTime}
                onChange={e => setCloseTime(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Intervalo por slot</label>
              <select className="select" value={interval} onChange={e => setInterval(Number(e.target.value))}>
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="label">Motivo padrão para bloqueio</label>
              <input className="input" placeholder="Ex: Folga, almoço..." value={blockReason}
                onChange={e => setBlockReason(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Date navigation ── */}
      <div className={s.datePicker}>
        {quickDates.map(d => {
          const dt = new Date(d + 'T00:00:00');
          return (
            <button key={d}
              className={`${s.dateBtn} ${d === date ? s.dateBtnActive : ''} ${d === today() ? s.dateBtnToday : ''}`}
              onClick={() => setDate(d)}>
              <span className={s.dateBtnDay}>{dt.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
              <span className={s.dateBtnNum}>{dt.getDate()}</span>
            </button>
          );
        })}
        <input type="date" className={s.dateInput} value={date}
          onChange={e => setDate(e.target.value)} title="Outra data" />
      </div>

      {/* ── Legend ── */}
      <div className={s.legend}>
        <span className={s.legendItem}><span className={`${s.dot} ${s.dotFree}`}/>Livre</span>
        <span className={s.legendItem}><span className={`${s.dot} ${s.dotOccupied}`}/>Agendado</span>
        <span className={s.legendItem}><span className={`${s.dot} ${s.dotBlocked}`}/>Bloqueado</span>
        <span className={s.legendNote}>
          Clique num slot livre para bloquear · Clique num agendamento para detalhes
        </span>
      </div>

      {/* ── Cinema Grid ── */}
      {barbers.length === 0 ? (
        <div className="empty"><div className="empty-icon">◷</div><div>Cadastre barbeiros para ver a grade.</div></div>
      ) : (
        <div className={s.gridWrapper}>
          {/* Time column header */}
          <div className={s.cinemaGrid} style={{ '--barber-count': barbers.length } as React.CSSProperties}>

            {/* Corner cell */}
            <div className={s.cornerCell}>
              <span className={s.cornerText}>{slots.length} slots</span>
            </div>

            {/* Barber headers */}
            {barbers.map(barber => (
              <div key={barber.id} className={s.barberHeader}>
                <div className={s.barberAvatar}>
                  {barber.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className={s.barberHeaderInfo}>
                  <div className={s.barberHeaderName}>{barber.name}</div>
                  <div className={s.barberHeaderStats}>
                    <span className={s.statFree}>{freeCount(barber.id)} livres</span>
                    <span className={s.statDot}>·</span>
                    <span className={s.statOcc}>{occupiedCount(barber.id)} ag.</span>
                    <span className={s.statDot}>·</span>
                    <span className={s.statBlk}>{blockedCount(barber.id)} bloq.</span>
                  </div>
                </div>
                <div className={`${s.availDot} ${barber.available ? s.availGreen : s.availRed}`} />
              </div>
            ))}

            {/* Time rows */}
            {slots.map((time, rowIdx) => {
              const isHour = time.endsWith(':00');
              return (
                <React.Fragment key={time}>
                  {/* Time label */}
                  <div className={`${s.timeCell} ${isHour ? s.timeCellHour : ''}`}>
                    <span className={s.timeLabel}>{time}</span>
                    {isHour && <div className={s.hourLine} />}
                  </div>

                  {/* Slot cells for each barber */}
                  {barbers.map(barber => {
                    const info = getSlotInfo(barber.id, time);
                    const key  = `${barber.id}-${time}`;
                    const busy = processing === key;

                    // Continuation slots — invisible (merged visually)
                    if (info.status === 'continuation') {
                      return <div key={barber.id} className={s.continuationCell} />;
                    }

                    if (info.status === 'occupied' && info.appointment && info.isStart) {
                      const apt   = info.appointment;
                      const svc   = services.find(sv => sv.id === apt.serviceId);
                      return (
                        <div
                          key={barber.id}
                          className={s.occupiedCell}
                          style={{
                            '--apt-color': STATUS_COLOR[apt.status],
                            gridRow: `span ${info.span ?? 1}`,
                          } as React.CSSProperties}
                          onClick={() => setSelectedApt(apt)}
                          title={`${apt.clientName} — ${apt.serviceName}`}
                        >
                          <div className={s.aptCellContent}>
                            <div className={s.aptCellName}>{apt.clientName}</div>
                            <div className={s.aptCellSvc}>{svc?.icon ?? '✂'} {apt.serviceName}</div>
                            <span className={`tag tag-${apt.status}`} style={{ fontSize: '0.55rem' }}>
                              {STATUS_LABEL[apt.status]}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    if (info.status === 'blocked') {
                      const bl = blocked.find(b => b.barberId === barber.id && b.time === time);
                      return (
                        <div key={barber.id} className={s.blockedCell}
                          onClick={() => handleSlotClick(barber.id, barber.name, time)}
                          title={bl?.reason ? `Bloqueado: ${bl.reason}` : 'Clique para liberar'}>
                          {busy ? <span className="spinner" style={{ width: 12, height: 12 }} /> : (
                            <span className={s.blockedIcon}>✕</span>
                          )}
                          {bl?.reason && <span className={s.blockedReason}>{bl.reason}</span>}
                        </div>
                      );
                    }

                    // Free
                    return (
                      <div key={barber.id}
                        className={`${s.freeCell} ${rowIdx % 2 === 0 ? s.freeCellAlt : ''}`}
                        onClick={() => handleSlotClick(barber.id, barber.name, time)}
                        title={`Bloquear ${time} — ${barber.name}`}>
                        {busy && <span className="spinner" style={{ width: 12, height: 12 }} />}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Appointment detail modal ── */}
      {selectedApt && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setSelectedApt(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Detalhes do Agendamento</span>
              <button className="modal-close" onClick={() => setSelectedApt(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className={s.aptDetail}>
                <div className={s.aptDetailRow}>
                  <span className={s.aptDetailLabel}>Cliente</span>
                  <span className={s.aptDetailValue}>{selectedApt.clientName}</span>
                </div>
                <div className={s.aptDetailRow}>
                  <span className={s.aptDetailLabel}>Telefone</span>
                  <a href={`https://wa.me/${selectedApt.clientPhone?.replace(/\D/g,'')}`}
                    target="_blank" rel="noopener noreferrer" className={s.aptDetailPhone}>
                    📱 {selectedApt.clientPhone}
                  </a>
                </div>
                {selectedApt.clientEmail && (
                  <div className={s.aptDetailRow}>
                    <span className={s.aptDetailLabel}>E-mail</span>
                    <span className={s.aptDetailValue}>{selectedApt.clientEmail}</span>
                  </div>
                )}
                <div className={s.aptDetailDivider} />
                <div className={s.aptDetailRow}>
                  <span className={s.aptDetailLabel}>Serviço</span>
                  <span className={s.aptDetailValue}>{selectedApt.serviceName}</span>
                </div>
                <div className={s.aptDetailRow}>
                  <span className={s.aptDetailLabel}>Barbeiro</span>
                  <span className={s.aptDetailValue}>{selectedApt.barberName}</span>
                </div>
                <div className={s.aptDetailRow}>
                  <span className={s.aptDetailLabel}>Horário</span>
                  <span className={s.aptDetailValue}>{selectedApt.time} · {selectedApt.duration}min</span>
                </div>
                <div className={s.aptDetailRow}>
                  <span className={s.aptDetailLabel}>Valor</span>
                  <span className={s.aptDetailPrice}>R$ {selectedApt.price.toFixed(2).replace('.', ',')}</span>
                </div>
                {selectedApt.notes && (
                  <div className={s.aptDetailRow}>
                    <span className={s.aptDetailLabel}>Obs.</span>
                    <span className={s.aptDetailValue} style={{ fontStyle: 'italic' }}>{selectedApt.notes}</span>
                  </div>
                )}
                <div className={s.aptDetailDivider} />
                <div className={s.aptDetailRow}>
                  <span className={s.aptDetailLabel}>Status</span>
                  <span className={`tag tag-${selectedApt.status}`}>{STATUS_LABEL[selectedApt.status]}</span>
                </div>
              </div>

              {/* Status actions */}
              <div className={s.aptDetailActions}>
                {selectedApt.status === 'pending' && (
                  <button className="btn" style={{ background: 'var(--green-dim)', border: '1px solid rgba(45,206,137,0.3)', color: 'var(--green)' }}
                    onClick={() => handleStatusChange(selectedApt.id!, 'confirmed')}>
                    ✓ Confirmar
                  </button>
                )}
                {(selectedApt.status === 'pending' || selectedApt.status === 'confirmed') && (
                  <button className="btn" style={{ background: 'var(--blue-dim)', border: '1px solid rgba(94,114,228,0.3)', color: 'var(--blue)' }}
                    onClick={() => handleStatusChange(selectedApt.id!, 'completed')}>
                    Concluir
                  </button>
                )}
                {selectedApt.status !== 'cancelled' && (
                  <button className="btn btn-danger"
                    onClick={() => handleStatusChange(selectedApt.id!, 'cancelled')}>
                    ✕ Cancelar
                  </button>
                )}
                <button className="btn btn-ghost" style={{ marginLeft: 'auto' }}
                  onClick={() => handleRemoveApt(selectedApt.id!)}>
                  🗑 Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Schedule;
