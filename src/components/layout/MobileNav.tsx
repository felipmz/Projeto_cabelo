import React, { useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { useClientAuthModal } from '../ui/ClientAuthModal';
import styles from './MobileNav.module.css';

const navItems = [
  { href: '#home',     label: 'Início',  icon: '◈' },
  { href: '#services', label: 'Serviços',icon: '✦' },
  { href: '#book',     label: 'Agendar', icon: '◻' },
  { href: '#barbers',  label: 'Equipe',  icon: '◉' },
  { href: '#contact',  label: 'Contato', icon: '◇' },
];

const MobileNav: React.FC = () => {
  const [active, setActive] = useState('home');
  const { user, profile }   = useClientAuth();
  const { openModal }       = useClientAuthModal();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const mainEl = document.getElementById('main-content');
    const element = document.getElementById(id);
    if (element && mainEl) mainEl.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
    setActive(id);
  };

  const initials = (profile?.displayName || user?.displayName || '?')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <nav className={styles.mobileNav}>
      {navItems.map((item) => {
        const id = item.href.replace('#', '');
        return (
          <a key={item.href} href={item.href}
            className={`${styles.item} ${active === id ? styles.active : ''}`}
            onClick={(e) => handleNav(e, item.href)}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </a>
        );
      })}

      {/* Account */}
      <button className={`${styles.item} ${styles.accountItem}`}
        onClick={() => openModal(user ? 'profile' : 'login')}>
        {user && profile?.photoURL ? (
          <img src={profile.photoURL} alt="" className={styles.miniAvatar} />
        ) : user ? (
          <span className={`${styles.icon} ${styles.avatarInitials}`}>{initials}</span>
        ) : (
          <span className={styles.icon}>👤</span>
        )}
        <span className={styles.label}>{user ? 'Conta' : 'Entrar'}</span>
        {user && profile?.favorites && <span className={styles.favDot} />}
      </button>
    </nav>
  );
};

export default MobileNav;
