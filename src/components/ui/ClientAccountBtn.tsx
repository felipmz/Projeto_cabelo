import React from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { useClientAuthModal } from './ClientAuthModal';
import styles from './ClientAccountBtn.module.css';

const ClientAccountBtn: React.FC = () => {
  const { user, profile } = useClientAuth();
  const { openModal } = useClientAuthModal();

  const initials = (profile?.displayName || user?.displayName || '?')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  if (!user) {
    return (
      <button className={styles.loginBtn} onClick={() => openModal('login')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Entrar
      </button>
    );
  }

  return (
    <div className={styles.accountWrap}>
      <button className={styles.accountBtn} onClick={() => openModal('profile')} title="Minha conta">
        {profile?.photoURL ? (
          <img src={profile.photoURL} alt="avatar" className={styles.photo} />
        ) : (
          <span className={styles.initials}>{initials}</span>
        )}
        <span className={styles.accountName}>{profile?.displayName?.split(' ')[0]}</span>
      </button>
      {profile?.favorites && (
        <div className={styles.favDot} title="Favoritos definidos" />
      )}
    </div>
  );
};

export default ClientAccountBtn;
