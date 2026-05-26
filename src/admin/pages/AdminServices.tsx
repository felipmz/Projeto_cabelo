import React, { useState } from 'react';
import { useAdminServices } from '../hooks/useAdminFirestore';
import { Service } from '../../types';
import Toast from '../components/ui/Toast';
import s from './AdminServices.module.css';

const EMPTY: Omit<Service, 'id'> = { name: '', description: '', duration: 30, price: 0, icon: '✂️', order: 0 };

const ICONS = ['✂️','🪒','👑','⚡','🎨','💫','💈','🔥','💎','🌿'];

const AdminServices: React.FC = () => {
  const { data, loading, save, remove } = useAdminServices();
  const [modal, setModal] = useState<(Partial<Service> & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const openNew = () => setModal({ ...EMPTY });
  const openEdit = (s: Service) => setModal({ ...s });
  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!modal?.name || !modal.price) return;
    setSaving(true);
    try {
      await save(modal as Service);
      setToast({ msg: modal.id ? 'Serviço atualizado!' : 'Serviço criado!', type: 'success' });
      closeModal();
    } catch {
      setToast({ msg: 'Erro ao salvar.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remover este serviço?')) return;
    await remove(id);
    setToast({ msg: 'Serviço removido.', type: 'success' });
  };

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageLabel}>✦ SERVIÇOS</div>
          <h1 className={s.pageTitle}>Gerenciar<br/>Serviços</h1>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Novo Serviço</button>
      </div>

      {loading ? (
        <div className={s.grid}>
          {[1,2,3,4,5,6].map(i => <div key={i} className={`skel ${s.skel}`} />)}
        </div>
      ) : data.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✦</div>
          <div>Nenhum serviço cadastrado ainda.</div>
          <button className="btn btn-primary" onClick={openNew}>+ Criar primeiro serviço</button>
        </div>
      ) : (
        <div className={s.grid}>
          {data.map(svc => (
            <div key={svc.id} className={s.card}>
              <div className={s.cardTop}>
                <span className={s.icon}>{svc.icon}</span>
                <div className={s.cardActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(svc)}>✎ Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemove(svc.id)}>🗑</button>
                </div>
              </div>
              <h3 className={s.name}>{svc.name}</h3>
              <p className={s.desc}>{svc.description}</p>
              <div className={s.cardFoot}>
                <span className={s.price}>R$ {svc.price.toFixed(2).replace('.', ',')}</span>
                <span className={s.dur}>{svc.duration} min</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{modal.id ? 'Editar Serviço' : 'Novo Serviço'}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {/* Icon picker */}
              <div className="field">
                <label className="label">Ícone</label>
                <div className={s.iconGrid}>
                  {ICONS.map(ic => (
                    <button key={ic} className={`${s.iconBtn} ${modal.icon === ic ? s.iconActive : ''}`}
                      onClick={() => setModal(m => m ? { ...m, icon: ic } : m)}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="label">Nome *</label>
                <input className="input" placeholder="Ex: Corte Clássico" value={modal.name ?? ''}
                  onChange={e => setModal(m => m ? { ...m, name: e.target.value } : m)} />
              </div>
              <div className="field">
                <label className="label">Descrição</label>
                <textarea className="textarea" placeholder="Descreva o serviço..." value={modal.description ?? ''}
                  onChange={e => setModal(m => m ? { ...m, description: e.target.value } : m)} />
              </div>
              <div className={s.row}>
                <div className="field">
                  <label className="label">Preço (R$) *</label>
                  <input type="number" className="input" placeholder="45" min="0" value={modal.price ?? ''}
                    onChange={e => setModal(m => m ? { ...m, price: Number(e.target.value) } : m)} />
                </div>
                <div className="field">
                  <label className="label">Duração (min)</label>
                  <input type="number" className="input" placeholder="40" min="5" step="5" value={modal.duration ?? ''}
                    onChange={e => setModal(m => m ? { ...m, duration: Number(e.target.value) } : m)} />
                </div>
                <div className="field">
                  <label className="label">Ordem</label>
                  <input type="number" className="input" placeholder="1" min="0" value={modal.order ?? ''}
                    onChange={e => setModal(m => m ? { ...m, order: Number(e.target.value) } : m)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" disabled={saving || !modal.name || !modal.price} onClick={handleSave}>
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

export default AdminServices;
