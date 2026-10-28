import { useCallback, useEffect, useState } from 'react';
import { Building2, ListTodo, LogOut, Menu, Plus, RefreshCw, Settings, SunMoon, Users, X } from 'lucide-react';

import logo from '../assets/logo-couts-512.webp';
import { all, api } from './api.js';
import Leads from './Leads.jsx';
import LeadDetail from './LeadDetail.jsx';
import Activities from './Activities.jsx';
import Companies from './Companies.jsx';
import Team from './Team.jsx';
import Editor from './Editor.jsx';

const MENU = [
  ['Leads', Users],
  ['Empresas', Building2],
  ['Atividades', ListTodo],
  ['Configurações', Settings],
];

const LEDE = {
  Leads: 'Receba os contatos do site e organize os próximos atendimentos.',
  Empresas: 'Empresas vinculadas aos seus contatos.',
  Atividades: 'Organize ligações, reuniões e retornos aos leads.',
  Configurações: 'Aprove novos acessos e gerencie a equipe.',
};

const THEME_KEY = 'couts:crm-theme';
const readTheme = () => {
  try { return localStorage.getItem(THEME_KEY) === 'dark'; } catch { return false; }
};

/**
 * /admin/crm — painel de leads (mesmo modelo do CRM da Mundi Data).
 *
 * A sessão é conferida em GET /api/auth: sem login, volta para /login. Todos
 * os dados passam pela API, que valida o perfil e consulta o banco com o JWT
 * do usuário (RLS), então abrir esta página sem sessão não expõe nada.
 */
export default function Crm() {
  const [session, setSession] = useState(null); // { userId, name, role }
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState('Leads');
  const [dark, setDark] = useState(readTheme);
  const [nav, setNav] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [data, setData] = useState({});
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    api('auth')
      .then(setSession)
      .catch((e) => {
        if (e.code === 'not_configured') setMissing(true);
        else if (e.status === 401) window.location.replace('/login');
        else setError(e.message);
      });
  }, []);

  const role = session?.role || 'comercial';
  const name = session?.name || 'Equipe';

  const refresh = useCallback(async () => {
    if (!session) return;
    setBusy(true);
    setError('');
    try {
      const entities = ['contacts', 'companies', 'profiles', 'activities'];
      const rows = await Promise.all(entities.map((entity) => all(entity)));
      setData(Object.fromEntries(entities.map((entity, i) => [entity, rows[i]])));
    } catch (e) {
      if (e.status === 401) window.location.replace('/login');
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Novos leads aparecem sozinhos enquanto a aba estiver visível.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, 60000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch { /* só nesta sessão */ }
  }, [dark]);

  // /admin/crm?lead=<uuid> abre direto o detalhe (links compartilhados pela equipe).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('lead');
    const row = data.contacts?.find((c) => c.id === id);
    if (row) setSelected(row);
    else if (selected) setSelected(data.contacts?.find((c) => c.id === selected.id) || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.contacts]);

  const openLead = (row) => {
    setSelected(row);
    window.history.replaceState(null, '', `?lead=${row.id}`);
    window.scrollTo(0, 0);
  };

  const switchTab = (label) => {
    setTab(label);
    setSelected(null);
    setNav(false);
    window.history.replaceState(null, '', '/admin/crm');
  };

  const save = async (entity, values, id) => {
    setBusy(true);
    setError('');
    try {
      await api(`crm/${entity}`, id ? 'PATCH' : 'POST', id ? { ...values, id } : values);
      setEditor(null);
      setSuccess('Alterações salvas.');
      await refresh();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await api('auth', 'POST', { action: 'logout' });
      window.location.href = '/login';
    } catch (e) {
      setError(e.message);
    }
  };

  const initials = name.slice(0, 2).toUpperCase();
  const shared = { data, role, busy, missing, edit: setEditor, openLead, refresh, setError };
  const canCreate = !selected && (tab === 'Atividades' || (tab === 'Empresas' && role !== 'comercial'));

  return (
    <div className={`crm${dark ? ' dark' : ''}`}>
      <aside className={nav ? 'open' : ''}>
        <a href="/" className="brand" aria-label="COUTS — abrir o site">
          <img src={logo} alt="" width={512} height={512} />
        </a>
        <div className="workspace">
          <span className="workspace-icon">C</span>
          <div>
            Workspace comercial<small>COUTS · CRM</small>
          </div>
        </div>
        <p className="nav-label">GESTÃO COMERCIAL</p>
        <nav>
          {MENU.filter(([label]) => label !== 'Configurações' || role === 'admin').map(([label, Icon]) => (
            <button className={tab === label && !selected ? 'active' : ''} key={label} onClick={() => switchTab(label)}>
              <Icon size={18} aria-hidden="true" />
              {label}
              {label === 'Leads' && <small>{data.contacts?.length ?? '—'}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="avatar">{initials}</span>
          <div>
            {name}
            <small>{role}</small>
          </div>
          <button aria-label="Sair" title="Sair" onClick={logout}>
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <div className="workspace-main">
        <header>
          <button className="mobile-toggle icon-button" aria-label="Menu" aria-expanded={nav} onClick={() => setNav(!nav)}>
            <Menu />
          </button>
          <span>
            COUTS <b>/</b> Comercial <b>/</b> {selected ? 'Detalhes do lead' : tab}
          </span>
          <div className="header-actions">
            <span className={`live${missing ? ' is-off' : ''}`}>
              <i /> {missing ? 'Aguardando configuração' : 'Dados do CRM'}
            </span>
            <button className="icon-button" aria-label="Alternar tema" title="Alternar tema" onClick={() => setDark(!dark)}>
              <SunMoon size={18} />
            </button>
            <span className="avatar">{initials}</span>
          </div>
        </header>

        <main>
          <div className="page-heading">
            <div>
              <p className="eyebrow">CAPTAÇÃO E ATENDIMENTO</p>
              <h1>{selected ? selected.name : tab}</h1>
              <p>{selected ? 'Dados do contato e histórico de atendimento.' : LEDE[tab]}</p>
            </div>
            <div className="actions">
              <button className="secondary" disabled={busy || missing || !session} onClick={refresh}>
                <RefreshCw size={15} /> Atualizar
              </button>
              {canCreate && (
                <button disabled={missing || busy} onClick={() => setEditor({ entity: tab === 'Empresas' ? 'companies' : 'activities' })}>
                  <Plus size={16} /> {tab === 'Empresas' ? 'Nova empresa' : 'Nova atividade'}
                </button>
              )}
            </div>
          </div>

          {missing && (
            <div className="notice">
              <strong>Configure o Supabase para ativar o CRM.</strong>
              <ol>
                <li>Aplique supabase/migrations/202610270001_crm.sql no SQL Editor do Supabase.</li>
                <li>Cadastre SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY e SUPABASE_SECRET_KEY na Vercel e publique de novo.</li>
                <li>Crie o primeiro administrador conforme o README.</li>
              </ol>
            </div>
          )}
          {error && (
            <div className="alert" role="alert">
              {error}
              <button className="icon-button" aria-label="Fechar erro" onClick={() => setError('')}>
                <X size={16} />
              </button>
            </div>
          )}
          {success && (
            <div className="success" role="status">
              {success}
              <button className="icon-button" aria-label="Fechar mensagem" onClick={() => setSuccess('')}>
                <X size={16} />
              </button>
            </div>
          )}

          {selected ? (
            <LeadDetail row={selected} {...shared} onClose={() => switchTab('Leads')} />
          ) : tab === 'Leads' ? (
            <Leads {...shared} />
          ) : tab === 'Atividades' ? (
            <Activities {...shared} />
          ) : tab === 'Empresas' ? (
            <Companies {...shared} />
          ) : tab === 'Configurações' && role === 'admin' ? (
            <Team {...shared} />
          ) : null}

          <footer>COUTS · Captação e acompanhamento de leads</footer>
        </main>
      </div>

      {editor && (
        <Editor
          editor={editor}
          data={data}
          selected={selected}
          role={role}
          userId={session?.userId}
          busy={busy}
          error={error}
          save={save}
          close={() => setEditor(null)}
        />
      )}
    </div>
  );
}
