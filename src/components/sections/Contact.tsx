import React from 'react';
import { useFirestoreBarberInfo } from '../../hooks/useFirestore';
import styles from './Contact.module.css';

const Contact: React.FC = () => {
  const { data: info } = useFirestoreBarberInfo();

  const cards = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
        </svg>
      ),
      label: 'WhatsApp',
      value: info.whatsapp ? info.whatsapp.replace(/\D/g, '').replace(/^55/, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : info.phone,
      href: `https://wa.me/${info.whatsapp}`,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: 'E-mail',
      value: info.email,
      href: `mailto:${info.email}`,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ),
      label: 'Instagram',
      value: info.instagram,
      href: `https://instagram.com/${info.instagram?.replace('@', '')}`,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: 'Endereço',
      value: info.address,
      href: `https://maps.google.com/?q=${encodeURIComponent(info.address)}`,
    },
  ];

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.header}>
        <div className="section-label">◇ Contato</div>
        <h2 className={styles.title}>FALE<br/><span>CONOSCO</span></h2>
        <p className={styles.sub}>{info.openHours}</p>
      </div>

      <div className={styles.grid}>
        {cards.map(card => (
          <a
            key={card.label}
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <div className={styles.cardIcon}>{card.icon}</div>
            <div>
              <div className={styles.cardLabel}>{card.label}</div>
              <div className={styles.cardValue}>{card.value}</div>
            </div>
            <span className={styles.arrow}>→</span>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.footerIcon}>✂</span>
          <span className={styles.footerName}>{info.name}</span>
        </div>
        <div className={styles.footerText}>
          © {new Date().getFullYear()} {info.name}. Todos os direitos reservados.
        </div>
      </div>
    </section>
  );
};

export default Contact;
