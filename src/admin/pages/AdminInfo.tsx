import React, { useState, useEffect } from 'react';
import { useAdminBarberInfo } from '../hooks/useAdminFirestore';
import { barberInfo as defaultInfo } from '../../data';
import { BarberInfo } from '../../types';
import Toast from '../components/ui/Toast';
import s from './AdminInfo.module.css';

const AdminInfo: React.FC = () => {
  const { data, loading, save } = useAdminBarberInfo();
  const [form, setForm] = useState<BarberInfo>(defaultInfo);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = <K extends keyof BarberInfo>(k: K, v: BarberInfo[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      setToast({ msg: 'Informações salvas com sucesso!', type: 'success' });
    } catch {
      setToast({ msg: 'Erro ao salvar. Tente novamente.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={s.page}>
        <div className={s.skels}>
          {[1,2,3,4].map(i => <div key={i} className={`skel ${s.skel}`} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageLabel}>◇ BARBEARIA</div>
          <h1 className={s.pageTitle}>Informações<br/>da Barbearia</h1>
        </div>
        <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? <><span className="spinner" /> Salvando...</> : '✓ Salvar Alterações'}
        </button>
      </div>

      <div className={s.sections}>
        {/* Identidade */}
        <div className={s.section}>
          <div className={s.sectionTitle}>Identidade</div>
          <div className={s.grid}>
            <div className="field">
              <label className="label">Nome da barbearia *</label>
              <input className="input" placeholder="BarberX" value={form.name}
                onChange={e => set('name', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Tagline / slogan</label>
              <input className="input" placeholder="Precisão. Estilo. Identidade." value={form.tagline}
                onChange={e => set('tagline', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Sobre a barbearia</label>
              <textarea className="textarea" rows={3} placeholder="Fale sobre a história e diferenciais..." value={form.about}
                onChange={e => set('about', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className={s.section}>
          <div className={s.sectionTitle}>Contato & Redes</div>
          <div className={s.grid}>
            <div className="field">
              <label className="label">Telefone</label>
              <input className="input" placeholder="(79) 99999-0000" value={form.phone}
                onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">WhatsApp (com DDI, ex: 5579...)</label>
              <input className="input" placeholder="5579999990000" value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">E-mail</label>
              <input type="email" className="input" placeholder="contato@barberx.com" value={form.email}
                onChange={e => set('email', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Instagram</label>
              <input className="input" placeholder="@barberx" value={form.instagram}
                onChange={e => set('instagram', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Localização & Horários */}
        <div className={s.section}>
          <div className={s.sectionTitle}>Localização & Funcionamento</div>
          <div className={s.grid}>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Endereço completo</label>
              <input className="input" placeholder="Rua das Navalhas, 42 — Centro" value={form.address}
                onChange={e => set('address', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Horário de funcionamento</label>
              <input className="input" placeholder="Seg–Sáb: 09h–20h" value={form.openHours}
                onChange={e => set('openHours', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminInfo;
