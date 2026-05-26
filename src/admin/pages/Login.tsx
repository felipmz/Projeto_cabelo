import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import s from './Login.module.css';

type AuthView = 'login' | 'register' | 'forgot';

const Login: React.FC = () => {
  const { signIn, signUp, resetPassword, error, clearError } = useAuth();

  const [view, setView]         = useState<AuthView>('login');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');

  // campos
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [name, setName]         = useState('');
  const [barber, setBarber]     = useState('');

  const switchView = (v: AuthView) => {
    clearError();
    setSuccess('');
    setView(v);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await signIn(email, password); } catch { /* error no hook */ }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      return; // validação inline no campo
    }
    setLoading(true);
    try { await signUp(email, password, name, barber); } catch { /* error no hook */ }
    finally { setLoading(false); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch { /* error no hook */ }
    finally { setLoading(false); }
  };

  const passwordMismatch = view === 'register' && confirm.length > 0 && password !== confirm;

  return (
    <div className={s.page}>
      <div className={s.grid} aria-hidden />

      <div className={s.card}>
        {/* Logo */}
        <div className={s.logo}>
          <span className={s.logoIcon}>✂</span>
          <div>
            <div className={s.logoName}>BarberX</div>
            <div className={s.logoSub}>PAINEL ADMIN</div>
          </div>
        </div>

        {/* ── LOGIN ── */}
        {view === 'login' && (
          <>
            <h1 className={s.title}>Acessar<br/><span>Painel</span></h1>
            <p className={s.sub}>Entre com suas credenciais de administrador.</p>

            <form onSubmit={handleLogin} className={s.form}>
              <div className="field">
                <label className="label">E-mail</label>
                <input type="email" className="input" placeholder="admin@barberx.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="field">
                <label className="label">Senha</label>
                <input type="password" className="input" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>

              {error && <div className={s.error}><span>⚠</span> {error}</div>}

              <button type="submit" className={`btn btn-primary ${s.submitBtn}`} disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className={s.links}>
              <button className={s.linkBtn} onClick={() => switchView('forgot')}>Esqueci minha senha</button>
              <span className={s.sep}>·</span>
              <button className={s.linkBtn} onClick={() => switchView('register')}>Criar conta</button>
            </div>
          </>
        )}

        {/* ── REGISTRO ── */}
        {view === 'register' && (
          <>
            <h1 className={s.title}>Criar<br/><span>Conta</span></h1>
            <p className={s.sub}>Configure sua barbearia em menos de 1 minuto.</p>

            <form onSubmit={handleRegister} className={s.form}>
              <div className="field">
                <label className="label">Seu nome *</label>
                <input type="text" className="input" placeholder="João Silva"
                  value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
              </div>
              <div className="field">
                <label className="label">Nome da barbearia *</label>
                <input type="text" className="input" placeholder="BarberX Studio"
                  value={barber} onChange={e => setBarber(e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">E-mail *</label>
                <input type="email" className="input" placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="field">
                <label className="label">Senha * (mín. 6 caracteres)</label>
                <input type="password" className="input" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="field">
                <label className="label">Confirmar senha *</label>
                <input
                  type="password"
                  className={`input ${passwordMismatch ? s.inputError : ''}`}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
                {passwordMismatch && <span className={s.fieldError}>Senhas não conferem</span>}
              </div>

              {error && <div className={s.error}><span>⚠</span> {error}</div>}

              <button type="submit" className={`btn btn-primary ${s.submitBtn}`}
                disabled={loading || passwordMismatch || !name || !barber}>
                {loading && <span className="spinner" />}
                {loading ? 'Criando conta...' : 'Criar conta grátis'}
              </button>
            </form>

            <div className={s.links}>
              <span className={s.subText}>Já tem conta?</span>
              <button className={s.linkBtn} onClick={() => switchView('login')}>Entrar</button>
            </div>
          </>
        )}

        {/* ── RECUPERAR SENHA ── */}
        {view === 'forgot' && (
          <>
            <h1 className={s.title}>Recuperar<br/><span>Senha</span></h1>
            <p className={s.sub}>Informe seu e-mail e enviaremos um link de redefinição.</p>

            <form onSubmit={handleForgot} className={s.form}>
              <div className="field">
                <label className="label">E-mail</label>
                <input type="email" className="input" placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>

              {error && <div className={s.error}><span>⚠</span> {error}</div>}
              {success && <div className={s.successMsg}><span>✓</span> {success}</div>}

              <button type="submit" className={`btn btn-primary ${s.submitBtn}`} disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>

            <div className={s.links}>
              <button className={s.linkBtn} onClick={() => switchView('login')}>← Voltar ao login</button>
            </div>
          </>
        )}

        <div className={s.footer}>
          <a href="/" className={s.backLink}>← Voltar ao site</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
