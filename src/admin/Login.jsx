import { useEffect, useState } from 'react';

import logo from '../assets/logo-couts-512.webp';

const TITLES = {
  login: ['Bem-vindo de volta.', 'Acompanhe os leads e atendimentos da COUTS.'],
  register: ['Solicitar acesso', 'Cadastre-se para acessar o CRM. O acesso depende da aprovação do administrador.'],
  recover: ['Recuperar senha', 'Informe seu e-mail para receber um link de recuperação.'],
  reset: ['Definir nova senha', 'Escolha uma nova senha com pelo menos 12 caracteres.'],
};

const SUBMIT = { login: 'Entrar', register: 'Enviar solicitação', recover: 'Enviar link', reset: 'Salvar nova senha' };
const ACTION = { login: 'login', register: 'register', recover: 'recover', reset: 'update' };

/** /login — entrada da equipe. Não há link para cá no site público. */
export default function Login() {
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === '1') setMode('reset');
    if (params.get('error') === 'callback') setMessage('O link é inválido ou expirou. Solicite um novo.');
  }, []);

  const changeMode = (next) => {
    setMode(next);
    setMessage('');
    window.history.replaceState(null, '', '/login');
  };

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if ((mode === 'reset' || mode === 'register') && data.password !== data.confirmPassword) {
      setMessage('As senhas não conferem.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: ACTION[mode], name: data.name, email: data.email, password: data.password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Não foi possível concluir a solicitação.');
      if (mode === 'login') {
        window.location.href = '/admin/crm';
        return;
      }
      if (mode === 'recover') {
        setMessage('Se o endereço estiver cadastrado, você receberá um link para redefinir a senha.');
        return;
      }
      form.reset();
      changeMode('login');
      setMessage(
        mode === 'register'
          ? 'Solicitação enviada. Confirme o cadastro pelo e-mail, se solicitado, e aguarde a aprovação do administrador.'
          : 'Senha atualizada. Entre com a nova senha.',
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  const [title, lede] = TITLES[mode];
  const newPassword = mode === 'reset' || mode === 'register';

  return (
    <main className="login">
      <form onSubmit={submit}>
        <a className="brand" href="/" aria-label="COUTS — voltar ao site">
          <img src={logo} alt="" width={512} height={512} />
        </a>
        <p className="eyebrow">ÁREA DA EQUIPE</p>
        <h1>{title}</h1>
        <p>{lede}</p>
        {mode === 'register' && (
          <label>
            Nome completo
            <input name="name" autoComplete="name" minLength={2} maxLength={120} required />
          </label>
        )}
        {mode !== 'reset' && (
          <label>
            E-mail
            <input name="email" type="email" autoComplete="username" required />
          </label>
        )}
        {mode !== 'recover' && (
          <label>
            {mode === 'reset' ? 'Nova senha' : 'Senha'}
            <input
              name="password"
              type="password"
              autoComplete={newPassword ? 'new-password' : 'current-password'}
              minLength={newPassword ? 12 : undefined}
              maxLength={128}
              required
            />
          </label>
        )}
        {newPassword && (
          <label>
            Confirme a senha
            <input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
          </label>
        )}
        <button disabled={busy}>{busy ? 'Aguarde…' : SUBMIT[mode]}</button>
        {mode === 'login' ? (
          <>
            <button type="button" className="secondary" disabled={busy} onClick={() => changeMode('register')}>
              Não tenho conta — solicitar acesso
            </button>
            <button type="button" className="secondary" disabled={busy} onClick={() => changeMode('recover')}>
              Esqueci minha senha
            </button>
          </>
        ) : (
          <button type="button" className="secondary" disabled={busy} onClick={() => changeMode('login')}>
            Voltar ao login
          </button>
        )}
        <p role="status">{message}</p>
        <a href="/">Voltar ao site</a>
      </form>
    </main>
  );
}
