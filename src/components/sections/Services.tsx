import React from 'react';
import { useFirestoreServices } from '../../hooks/useFirestore';
import styles from './Services.module.css';

const Services: React.FC = () => {
  const { data: services, loading } = useFirestoreServices();

  return (
    <section id="services" className={styles.section}>
      <div className={styles.header}>
        <div className="section-label">✦ Nossos Serviços</div>
        <h2 className={styles.title}>O QUE<br/><span>OFERECEMOS</span></h2>
        <p className={styles.sub}>
          Cada serviço executado com técnica refinada e produtos de alta performance.
        </p>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${styles.card} ${styles.skeleton}`} />
            ))
          : services.map((service, i) => (
              <div
                key={service.id}
                className={styles.card}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={styles.cardTop}>
                  <span className={styles.icon}>{service.icon}</span>
                  <div className={styles.duration}>
                    <span className={styles.durationNum}>{service.duration}</span>
                    <span className={styles.durationUnit}>min</span>
                  </div>
                </div>

                <h3 className={styles.name}>{service.name}</h3>
                <p className={styles.desc}>{service.description}</p>

                <div className={styles.cardBottom}>
                  <span className={styles.price}>
                    R$ <strong>{service.price.toFixed(2).replace('.', ',')}</strong>
                  </span>
                  <button
                    className={styles.bookBtn}
                    onClick={() => {
                      const el = document.getElementById('book');
                      const main = document.getElementById('main-content');
                      if (el && main) main.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
                    }}
                  >
                    Agendar →
                  </button>
                </div>

                <div className={styles.cornerAccent} />
              </div>
            ))}
      </div>
    </section>
  );
};

export default Services;
