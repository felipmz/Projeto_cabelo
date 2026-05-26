import React from 'react';
import { useFirestoreTestimonials } from '../../hooks/useFirestore';
import styles from './Testimonials.module.css';

const Stars = ({ n }: { n: number }) => (
  <div className={styles.stars}>
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: i < n ? 'var(--gold)' : 'var(--border)' }}>★</span>
    ))}
  </div>
);

const Testimonials: React.FC = () => {
  const { data: testimonials } = useFirestoreTestimonials();

  return (
    <section id="testimonials" className={styles.section}>
      <div className={styles.header}>
        <div className="section-label">◆ Depoimentos</div>
        <h2 className={styles.title}>O QUE<br/><span>DIZEM</span></h2>
      </div>

      <div className={styles.grid}>
        {testimonials.map((t, i) => (
          <div key={t.id} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
            <Stars n={t.rating} />
            <p className={styles.text}>"{t.text}"</p>
            <div className={styles.footer}>
              <div className={styles.initial}>{t.clientName[0]}</div>
              <div>
                <div className={styles.clientName}>{t.clientName}</div>
                <div className={styles.date}>{new Date(t.date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
