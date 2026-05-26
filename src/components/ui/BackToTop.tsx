import React, { useState, useEffect } from 'react';
import styles from './BackToTop.module.css';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;
    const handler = () => setVisible(main.scrollTop > 400);
    main.addEventListener('scroll', handler);
    return () => main.removeEventListener('scroll', handler);
  }, []);

  const scrollToTop = () => {
    const main = document.getElementById('main-content');
    main?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`${styles.btn} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
    >
      ↑
    </button>
  );
};

export default BackToTop;
