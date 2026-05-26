import React, { useState, useContext, createContext, useCallback } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { useFirestoreBarbers, useFirestoreServices } from '../../hooks/useFirestore';
import { uploadPhoto } from '../../firebase/uploadPhoto';
import PhotoUpload from './PhotoUpload';
import styles from './ClientAuthModal.module.css';

// ── Context so any child can open the modal ─────────────────
interface ClientAuthContextType {
  openModal: (view?: 'login' | 'register' | 'profile') => void;
}
export const ClientAuthContext = createContext<ClientAuthContextType>({ openModal: () => {} });
export const useClientAuthModal = () => useContext(ClientAuthContext);

type View = 'login' | 'register' | 'profile' | 'favorites';

export const ClientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('login');

  const openModal = useCallback((v: View = 'login') => {
    setView(v);
    setOpen(true);
  }, []);

  return (
    <ClientAuthContext.Provider value={{ openModal }}>
      {children}
      {open && (
        <ClientAuthModal
          initialView={view}
          onClose={() => setOpen(false)}
        />
      )}
    </ClientAuthContext.Provider>
  );
};

// ── Modal component ──────────────────────────────────────────
interface ModalProps {
  initialView: View;
  onClose: () => void;
}

const ClientAuthModal: React.FC<ModalProps> = ({ initialView, onClose }) => {
  const {
    user, profile, error, loading: authLoading,
    signIn, signUp, signOut, updateFavorites, updatePhoto, clearError,
  } = useClientAuth();

  const { data: barbers }  = useFirestoreBarbers();
  const { data: services } = useFirestoreServices();

  const [view, setView]       = useState<View>(() => {
    if (user) return initialView === 'login' || initialView === 'register' ? 'profile' : initialView;
    return initialView;
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // form fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');

  // favorites
  const [favBarber,  setFavBarber]  = useState(profile?.favorites?.barberId ?? '');
  const [favService, setFavService] = useState(profile?.favorites?.serviceId ?? '');
  const [favTime,    setFavTime]    = useState(profile?.favorites?.preferredTime ?? '');

  const switchView = (v: View) => { clearError(); setSuccess(''); setView(v); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      switchView('profile');
    } catch { /* error no hook */ }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    setLoading(true);
    try {
      await signUp(email, password, name, phone);
      switchView('profile');
    } catch { /* error no hook */ }
    finally { setLoading(false); }
  };

  const handleSaveFavorites = async () => {
    if (!favBarber || !favService) return;
    const bName = barbers.find(b => b.id === favBarber)?.name ?? '';
    const sName = services.find(s => s.id === favService)?.name ?? '';
    setLoading(true);
    await updateFavorites({ barberId: favBarber, barberName: bName, serviceId: favService, serviceName: sName, preferredTime: favTime });
    setSuccess('Favoritos salvos!');
    setLoading(false);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    const url = await uploadPhoto(file, `clients/${user.uid}/avatar`);
    await updatePhoto(url);
  };

  const handleSignOut = async () => { await signOut(); onClose(); };

  const initials = (profile?.displayName || name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const passwordMismatch = confirm.length > 0 && password !== confirm;

  const favBarberObj  = barbers.find(b => b.id === favBarber);
  const favUnavailable = favBarberObj && !favBarberObj.available;

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLogo}>
            <span className={styles.headerIcon}>✂</span>
            <span className={styles.headerName}>BarberX</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── LOGIN ── */}
        {view === 'login' && (
          <div className={styles.body}>
            <h2 className={styles.title}>Entrar</h2>
            <p className={styles.sub}>Acesse sua conta para agendamentos e favoritos.</p>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>E-mail</label>
                <input type="email" className={styles.input} placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Senha</label>
                <input type="password" className={styles.input} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <div className={styles.error}>⚠ {error}</div>}
              <button type="submit" className={styles.btnPrimary} disabled={loading || authLoading}>
                {loading ? <span className={styles.spinner} /> : null}
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className={styles.altLinks}>
              <span className={styles.altText}>Novo por aqui?</span>
              <button className={styles.linkBtn} onClick={() => switchView('register')}>Criar conta</button>
            </div>
          </div>
        )}

        {/* ── REGISTER ── */}
        {view === 'register' && (
          <div className={styles.body}>
            <h2 className={styles.title}>Criar Conta</h2>
            <p className={styles.sub}>Cadastre-se para agendar com facilidade.</p>

            <form onSubmit={handleRegister} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nome completo *</label>
                <input type="text" className={styles.input} placeholder="João Silva"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>WhatsApp</label>
                  <input type="tel" className={styles.input} placeholder="(79) 99999-0000"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>E-mail *</label>
                  <input type="email" className={styles.input} placeholder="seu@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Senha *</label>
                  <input type="password" className={styles.input} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Confirmar senha *</label>
                  <input type="password"
                    className={`${styles.input} ${passwordMismatch ? styles.inputError : ''}`}
                    placeholder="••••••••"
                    value={confirm} onChange={e => setConfirm(e.target.value)} required />
                </div>
              </div>
              {passwordMismatch && <span className={styles.fieldError}>Senhas não conferem</span>}
              {error && <div className={styles.error}>⚠ {error}</div>}
              <button type="submit" className={styles.btnPrimary}
                disabled={loading || authLoading || passwordMismatch || !name}>
                {loading ? <span className={styles.spinner} /> : null}
                {loading ? 'Criando...' : 'Criar conta'}
              </button>
            </form>

            <div className={styles.altLinks}>
              <span className={styles.altText}>Já tem conta?</span>
              <button className={styles.linkBtn} onClick={() => switchView('login')}>Entrar</button>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {view === 'profile' && user && (
          <div className={styles.body}>
            <div className={styles.profileHeader}>
              <PhotoUpload
                currentURL={profile?.photoURL}
                initials={initials}
                size={80}
                onUpload={handlePhotoUpload}
              />
              <div>
                <div className={styles.profileName}>{profile?.displayName ?? user.displayName}</div>
                <div className={styles.profileEmail}>{user.email}</div>
                {profile?.phone && <div className={styles.profilePhone}>📱 {profile.phone}</div>}
              </div>
            </div>

            {/* Favorites preview */}
            <div className={styles.favPreview} onClick={() => switchView('favorites')}>
              <div className={styles.favPreviewLeft}>
                <span className={styles.favIcon}>★</span>
                <div>
                  <div className={styles.favPreviewTitle}>Meus Favoritos</div>
                  {profile?.favorites ? (
                    <div className={styles.favPreviewSub}>
                      {profile.favorites.barberName} · {profile.favorites.serviceName}
                      {favUnavailable && <span className={styles.favWarn}> ⚠ Indisponível hoje</span>}
                    </div>
                  ) : (
                    <div className={styles.favPreviewSub}>Nenhum favorito definido</div>
                  )}
                </div>
              </div>
              <span className={styles.favArrow}>→</span>
            </div>

            <button className={styles.btnOutline} onClick={handleSignOut}>Sair da conta</button>
          </div>
        )}

        {/* ── FAVORITES ── */}
        {view === 'favorites' && user && (
          <div className={styles.body}>
            <button className={styles.backBtn} onClick={() => switchView('profile')}>← Voltar</button>
            <h2 className={styles.title}>Favoritos</h2>
            <p className={styles.sub}>
              Defina seu barbeiro e serviço padrão. Na hora de agendar, serão pré-selecionados.
            </p>

            {/* Barber select */}
            <div className={styles.field}>
              <label className={styles.label}>Barbeiro favorito</label>
              <div className={styles.optionList}>
                {barbers.map(b => (
                  <button key={b.id}
                    className={`${styles.optionBtn} ${favBarber === b.id ? styles.optionActive : ''} ${!b.available ? styles.optionUnavail : ''}`}
                    onClick={() => setFavBarber(b.id)}>
                    <div className={styles.optionAvatar}>
                      {b.photoURL
                        ? <img src={b.photoURL} alt={b.name} className={styles.optionPhoto} />
                        : b.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                      }
                    </div>
                    <div className={styles.optionInfo}>
                      <div className={styles.optionName}>{b.name}</div>
                      <div className={styles.optionSpec}>{b.specialty}</div>
                    </div>
                    {!b.available && <span className={styles.unavailBadge}>Indisponível hoje</span>}
                    {favBarber === b.id && <span className={styles.checkmark}>★</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Service select */}
            <div className={styles.field}>
              <label className={styles.label}>Serviço favorito</label>
              <div className={styles.optionList}>
                {services.map(sv => (
                  <button key={sv.id}
                    className={`${styles.optionBtn} ${favService === sv.id ? styles.optionActive : ''}`}
                    onClick={() => setFavService(sv.id)}>
                    <span className={styles.svcIcon}>{sv.icon}</span>
                    <div className={styles.optionInfo}>
                      <div className={styles.optionName}>{sv.name}</div>
                      <div className={styles.optionSpec}>R$ {sv.price.toFixed(2).replace('.', ',')} · {sv.duration}min</div>
                    </div>
                    {favService === sv.id && <span className={styles.checkmark}>★</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred time */}
            <div className={styles.field}>
              <label className={styles.label}>Horário preferido (opcional)</label>
              <input type="time" className={styles.input} value={favTime}
                onChange={e => setFavTime(e.target.value)} />
            </div>

            {/* Unavailable warning */}
            {favUnavailable && (
              <div className={styles.warnBox}>
                ⚠ <strong>{favBarberObj?.name}</strong> está marcado como indisponível hoje.
                Ao agendar, você poderá escolher outro barbeiro ou aguardar.
              </div>
            )}

            {success && <div className={styles.successBox}>✓ {success}</div>}

            <button className={styles.btnPrimary} disabled={loading || !favBarber || !favService}
              onClick={handleSaveFavorites}>
              {loading ? <span className={styles.spinner} /> : null}
              {loading ? 'Salvando...' : '★ Salvar Favoritos'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClientAuthModal;
