import React, { useEffect, useRef } from 'react';
import { useFirestoreBarberInfo } from '../../hooks/useFirestore';
import styles from './Hero.module.css';

const Hero: React.FC = () => {
  const { data: info } = useFirestoreBarberInfo();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    let raf: number;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const size = 60;
      ctx.strokeStyle = 'rgba(201,162,39,0.06)';
      ctx.lineWidth = 0.5;

      for (let x = 0; x < canvas.width + size; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height + size; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Scanline
      const scanY = ((frame * 1.5) % (canvas.height + 60)) - 30;
      const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, 'rgba(201,162,39,0.04)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 30, canvas.width, 60);
    };

    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    const main = document.getElementById('main-content');
    if (el && main) main.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  };

  return (
    <section id="home" className={styles.hero}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Big decorative text */}
      <div className={styles.bgText} aria-hidden>BARBER</div>

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>Agendamento Online Disponível</span>
        </div>

        <h1 className={styles.title}>
          <span className={styles.titleTop}>ESTILO</span>
          <span className={styles.titleBottom}>& PRECISÃO</span>
        </h1>

        <p className={styles.tagline}>{info.tagline}</p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>8+</span>
            <span className={styles.statLabel}>Anos de<br/>experiência</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>4.9</span>
            <span className={styles.statLabel}>Avaliação<br/>média</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>2k+</span>
            <span className={styles.statLabel}>Clientes<br/>satisfeitos</span>
          </div>
        </div>

        <div className={styles.ctas}>
          <button className="btn-gold" onClick={() => scrollTo('book')}>
            Agendar Agora
          </button>
          <button className="btn-outline" onClick={() => scrollTo('services')}>
            Ver Serviços
          </button>
        </div>
      </div>

      {/* Right decorative panel */}
      <div className={styles.rightPanel}>
        <div className={styles.scissors}>✂</div>
        <div className={styles.verticalText}>BARBER · STUDIO · PREMIUM</div>
      </div>

      {/* Bottom gradient fade */}
      <div className={styles.fade} />
    </section>
  );
};

export default Hero;
