import React from 'react';
import { useFirestoreBarbers } from '../../hooks/useFirestore';
import styles from './Barbers.module.css';

const INITIALS = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const Barbers: React.FC = () => {
  const { data: barbers } = useFirestoreBarbers();

  return (
    <section id="barbers" className={styles.section}>
      <div className={styles.header}>
        <div className="section-label">◉ A Equipe</div>
        <h2 className={styles.title}>NOSSOS<br/><span>BARBEIROS</span></h2>
      </div>

      <div className={styles.list}>
        {barbers.map((barber, i) => (
          <div
            key={barber.id}
            className={`${styles.card} ${!barber.available ? styles.unavailable : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={styles.avatar}>
              {INITIALS(barber.name)}
              <div className={`${styles.availBadge} ${barber.available ? styles.availGreen : styles.availRed}`} />
            </div>

            <div className={styles.info}>
              <div className={styles.name}>{barber.name}</div>
              <div className={styles.specialty}>{barber.specialty}</div>
              <div className={styles.status}>
                {barber.available ? '✓ Disponível hoje' : '✗ Indisponível'}
              </div>
            </div>

            <div className={styles.number}>
              {String(i + 1).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Barbers;
