import React from 'react';
import { useFirestoreBarberInfo } from '../../hooks/useFirestore';
import ClientAccountBtn from '../ui/ClientAccountBtn';
import styles from './Sidebar.module.css';

interface SidebarProps { activeSection: string; }

const navItems = [
  { href: '#home',         label: 'Início',    icon: '◈' },
  { href: '#services',     label: 'Serviços',  icon: '✦' },
  { href: '#barbers',      label: 'Barbeiros', icon: '◉' },
  { href: '#book',         label: 'Agendar',   icon: '◻' },
  { href: '#testimonials', label: 'Reviews',   icon: '◆' },
  { href: '#contact',      label: 'Contato',   icon: '◇' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection }) => {
  const { data: info } = useFirestoreBarberInfo();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const mainEl = document.getElementById('main-content');
    const element = document.getElementById(id);
    if (element && mainEl) {
      mainEl.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
    }
    window.history.pushState(null, '', href);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoMark}>✂</span>
        <div>
          <div className={styles.logoName}>{info.name}</div>
          <div className={styles.logoTagline}>BARBER STUDIO</div>
        </div>
      </div>

      <div className={styles.status}>
        <span className={styles.statusDot} />
        <span className={styles.statusText}>Online — Aberto agora</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const id = item.href.replace('#', '');
          const isActive = activeSection === id;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              onClick={(e) => handleNavClick(e, item.href)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {isActive && <span className={styles.activeLine} />}
            </a>
          );
        })}
      </nav>

      {/* Client account button */}
      <div className={styles.clientSection}>
        <ClientAccountBtn />
      </div>

      <div className={styles.sideFooter}>
        <div className={styles.hours}>{info.openHours}</div>
        <div className={styles.address}>{info.address}</div>
      </div>
    </aside>
  );
};

export default Sidebar;
