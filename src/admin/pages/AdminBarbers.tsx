import React, { useState } from 'react';
import { useAdminBarbers, updateBarberPhoto } from '../hooks/useAdminFirestore';
import { uploadPhoto } from '../../firebase/uploadPhoto';
import { Barber } from '../../types';
import PhotoUpload from '../../components/ui/PhotoUpload';
import Toast from '../components/ui/Toast';
import s from './AdminBarbers.module.css';

const EMPTY: Omit<Barber, 'id'> = { name: '', specialty: '', available: true, order: 0 };

const AdminBarbers: React.FC = () => {
  const { data, loading, save, remove, toggleAvailability } = useAdminBarbers();
  const [modal, setModal] = useState<(Partial<Barber> & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleSave = async () => {
    if (!modal?.name) return;
    setSaving(true);
    try {
      await save(modal as Barber);
      setToast({ msg: modal.id ? 'Barbeiro atualizado!' : 'Barbeiro adicionado!', type: 'success' });
      setModal(null);
    } catch {
      setToast({ msg: 'Erro ao salvar.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id);
    await toggleAvailability(id, !current);
    setToggling(null);
    setToast({ msg: `Barbeiro marcado como ${!current ? 'disponível' : 'indisponível'}.`, type: 'success' });
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remover este barbeiro?')) return;
    await remove(id);
    setToast({ msg: 'Barbeiro removido.', type: 'success' });
  };

  const handlePhotoUpload = async (barberId: string, file: File) => {
    const url = await uploadPhoto(file, `barbers/${barberId}/avatar`);
    await updateBarberPhoto(barberId, url);
    setToast({ msg: 'Foto atualizada!', type: 'success' });
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageLabel}>◉ BARBEIROS</div>
          <h1 className={s.pageTitle}>Gerenciar<br/>Equipe</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ ...EMPTY })}>+ Novo Barbeiro</button>
      </div>

      {loading ? (
        <div className={s.list}>
          {[1,2,3].map(i => <div key={i} className={`skel ${s.skel}`} />)}
        </div>
      ) : data.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">◉</div>
          <div>Nenhum barbeiro cadastrado.</div>
          <button className="btn btn-primary" onClick={() => setModal({ ...EMPTY })}>+ Adicionar barbeiro</button>
        </div>
      ) : (
        <div className={s.list}>
          {data.map(barber => (
            <div key={barber.id} className={`${s.card} ${!barber.available ? s.cardUnavail : ''}`}>
              <PhotoUpload
                currentURL={barber.photoURL}
                initials={initials(barber.name)}
                size={48}
                onUpload={(file) => handlePhotoUpload(barber.id, file)}
              />

              <div className={s.info}>
                <div className={s.name}>{barber.name}</div>
                <div className={s.specialty}>{barber.specialty}</div>
              </div>

              <div className={s.statusBadge}>
                <span className={`${s.dot} ${barber.available ? s.dotGreen : s.dotRed}`} />
                <span className={s.statusText}>{barber.available ? 'Disponível' : 'Indisponível'}</span>
              </div>

              <div className={s.actions}>
                <button
                  className={`btn btn-sm ${barber.available ? 'btn-danger' : ''}`}
                  style={!barber.available ? { background: 'var(--green-dim)', border: '1px solid rgba(45,206,137,0.3)', color: 'var(--green)' } : {}}
                  disabled={toggling === barber.id}
                  onClick={() => handleToggle(barber.id, barber.available)}
                >
                  {toggling === barber.id ? <span className="spinner" /> : barber.available ? 'Bloquear hoje' : 'Liberar'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal({ ...barber })}>✎</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleRemove(barber.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{modal.id ? 'Editar Barbeiro' : 'Novo Barbeiro'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="label">Nome completo *</label>
                <input className="input" placeholder="Ex: Marcus Vinicius" value={modal.name ?? ''}
                  onChange={e => setModal(m => m ? { ...m, name: e.target.value } : m)} />
              </div>
              <div className="field">
                <label className="label">Especialidade</label>
                <input className="input" placeholder="Ex: Cortes Modernos & Degradê" value={modal.specialty ?? ''}
                  onChange={e => setModal(m => m ? { ...m, specialty: e.target.value } : m)} />
              </div>
              <div className={s.row}>
                <div className="field">
                  <label className="label">Ordem de exibição</label>
                  <input type="number" className="input" placeholder="1" min="0" value={modal.order ?? ''}
                    onChange={e => setModal(m => m ? { ...m, order: Number(e.target.value) } : m)} />
                </div>
                <div className="field">
                  <label className="label">Disponibilidade</label>
                  <select className="select" value={modal.available ? 'true' : 'false'}
                    onChange={e => setModal(m => m ? { ...m, available: e.target.value === 'true' } : m)}>
                    <option value="true">Disponível</option>
                    <option value="false">Indisponível</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" disabled={saving || !modal.name} onClick={handleSave}>
                {saving ? <span className="spinner" /> : null}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminBarbers;
