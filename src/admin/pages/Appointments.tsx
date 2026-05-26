import React, { useState } from 'react';
import { useAdminAppointments } from '../hooks/useAdminFirestore';
import Toast from '../components/ui/Toast';
import s from './Appointments.module.css';

const today = () => new Date().toISOString().split('T')[0];
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído', cancelled: 'Cancelado',
};

const Appointments: React.FC = () => {
  const [date, setDate] = useState(today());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { data: apts, loading, updateStatus, remove } = useAdminAppointments(date);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // Quick date nav — previous 3 days + today + next 3 days
  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 2);
    return d.toISOString().split('T')[0];
  });

  const handleStatus = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    await updateStatus(id, status);
    setToast({ msg: `Status atualizado para "${STATUS_LABEL[status]}"`, type: 'success' });
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remover este agendamento?')) return;
    setRemoving(id);
    await remove(id);
    setRemoving(null);
    setToast({ msg: 'Agendamento removido.', type: 'success' });
  };

  const filtered = filterStatus === 'all' ? apts : apts.filter(a => a.status === filterStatus);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageLabel}>◻ AGENDAMENTOS</div>
          <h1 className={s.pageTitle}>Gerenciar<br/>Agenda</h1>
        </div>
      </div>

      {/* Quick date picker */}
      <div className={s.datePicker}>
        {quickDates.map(d => (
          <button
            key={d}
            className={`${s.dateBtn} ${d === date ? s.dateBtnActive : ''} ${d === today() ? s.dateBtnToday : ''}`}
            onClick={() => setDate(d)}
          >
            <span className={s.dateBtnDay}>{new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
            <span className={s.dateBtnNum}>{new Date(d + 'T00:00:00').getDate()}</span>
          </button>
        ))}
        <input
          type="date"
          className={s.dateInput}
          value={date}
          onChange={e => setDate(e.target.value)}
          title="Escolher outra data"
        />
      </div>

      {/* Filters */}
      <div className={s.filters}>
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(st => (
          <button
            key={st}
            className={`${s.filterBtn} ${filterStatus === st ? s.filterActive : ''}`}
            onClick={() => setFilterStatus(st)}
          >
            {st === 'all' ? 'Todos' : STATUS_LABEL[st]}
            {st !== 'all' && (
              <span className={s.filterCount}>
                {apts.filter(a => a.status === st).length}
              </span>
            )}
          </button>
        ))}
        <span className={s.totalCount}>{filtered.length} registro(s)</span>
      </div>

      {/* List */}
      {loading ? (
        <div className={s.skels}>
          {[1,2,3,4].map(i => <div key={i} className={`skel ${s.skel}`} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">◻</div>
          <div>Nenhum agendamento para {fmtDate(date)}</div>
        </div>
      ) : (
        <div className={s.list}>
          {filtered.map(apt => (
            <div key={apt.id} className={`${s.card} ${s[`card_${apt.status}`]}`}>
              <div className={s.cardLeft}>
                <div className={s.time}>{apt.time}</div>
                <div className={s.dur}>{apt.duration}min</div>
              </div>

              <div className={s.cardBody}>
                <div className={s.clientRow}>
                  <span className={s.clientName}>{apt.clientName}</span>
                  <span className={`tag tag-${apt.status}`}>{STATUS_LABEL[apt.status]}</span>
                </div>
                <div className={s.meta}>
                  <span>{apt.serviceName}</span>
                  <span className={s.sep}>·</span>
                  <span>{apt.barberName}</span>
                  {apt.clientPhone && (
                    <>
                      <span className={s.sep}>·</span>
                      <a href={`https://wa.me/${apt.clientPhone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className={s.phone}>
                        📱 {apt.clientPhone}
                      </a>
                    </>
                  )}
                </div>
                {apt.notes && <div className={s.notes}>Obs: {apt.notes}</div>}
              </div>

              <div className={s.cardRight}>
                <div className={s.price}>R$ {apt.price.toFixed(2).replace('.', ',')}</div>

                <div className={s.actions}>
                  {apt.status === 'pending' && (
                    <>
                      <button className="btn btn-sm" style={{ background: 'var(--green-dim)', border: '1px solid rgba(45,206,137,0.3)', color: 'var(--green)' }}
                        onClick={() => handleStatus(apt.id!, 'confirmed')}>Confirmar</button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => handleStatus(apt.id!, 'cancelled')}>Cancelar</button>
                    </>
                  )}
                  {apt.status === 'confirmed' && (
                    <button className="btn btn-sm" style={{ background: 'var(--blue-dim)', border: '1px solid rgba(94,114,228,0.3)', color: 'var(--blue)' }}
                      onClick={() => handleStatus(apt.id!, 'completed')}>Concluir</button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={removing === apt.id}
                    onClick={() => handleRemove(apt.id!)}
                  >🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Appointments;
