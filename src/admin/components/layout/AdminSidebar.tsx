import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import PhotoUpload from '../../../components/ui/PhotoUpload';
import { uploadPhoto } from '../../../firebase/uploadPhoto';
import { auth } from '../../../firebase/config';
import { updateAdminPhoto } from '../../hooks/useAdminFirestore';
import { updateProfile } from 'firebase/auth';
import s from './AdminSidebar.module.css';

export type AdminPage = 'dashboard' | 'appointments' | 'services' | 'barbers' | 'schedule' | 'info';

interface Props {
  current: AdminPage;
  onChange: (p: AdminPage) => void;
}

const NAV: { id: AdminPage; label: string; icon: string }[] = [
  { id: 'dashboard',    label: 'Dashboard',   icon: '◈' },
  { id: 'appointments', label: 'Agendamentos', icon: '◻' },
  { id: 'schedule',     label: 'Horários',     icon: '◷' },
  { id: 'services',     label: 'Serviços',     icon: '✦' },
  { id: 'barbers',      label: 'Barbeiros',    icon: '◉' },
  { id: 'info',         label: 'Barbearia',    icon: '◇' },
];

const AdminSidebar: React.FC<Props> = ({ current, onChange }) => {
  const { user, signOut } = useAuth();

  const handleAdminPhoto = async (file: File) => {
    if (!user) return;
    const url = await uploadPhoto(file, `admin/${user.uid}/avatar`);
    await updateAdminPhoto(url);
    if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: url });
  };

  return (
    <aside className={s.sidebar}>
      <div className={s.logo}>
        <span className={s.logoIcon}>✂</span>
        <div>
          <div className={s.logoName}>BarberX</div>
          <div className={s.logoSub}>ADMIN</div>
        </div>
      </div>

      <nav className={s.nav}>
        {NAV.map(item => (
          <button
            key={item.id}
            className={`${s.navItem} ${current === item.id ? s.active : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span className={s.navIcon}>{item.icon}</span>
            <span className={s.navLabel}>{item.label}</span>
            {current === item.id && <span className={s.activeLine} />}
          </button>
        ))}
      </nav>

      <div className={s.footer}>
        <div className={s.userInfo}>
          <PhotoUpload
            currentURL={user?.photoURL ?? undefined}
            initials={user?.email?.[0].toUpperCase() ?? 'A'}
            size={30}
            onUpload={handleAdminPhoto}
          />
          <div className={s.userEmail}>{user?.email}</div>
        </div>
        <button className={s.signOut} onClick={signOut} title="Sair">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
