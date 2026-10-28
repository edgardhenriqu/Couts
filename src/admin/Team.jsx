import { useCallback, useEffect, useState } from 'react';

import { api, date } from './api.js';

/** Configurações (só admin): solicitações de acesso e equipe. */
export default function Team({ data, busy, edit, refresh }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRequests((await api('access-requests')).data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function review(row, decision) {
    const verb = decision === 'approved' ? 'Aprovar acesso como comercial para' : 'Recusar a solicitação de';
    if (loading || !window.confirm(`${verb} ${row.name} (${row.email})?`)) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api('access-requests', 'POST', { id: row.id, decision });
      setRequests((current) => current.map((r) => (r.id === row.id ? { ...r, status: decision, reviewed_at: new Date().toISOString() } : r)));
      setMessage(
        decision === 'approved'
          ? 'Acesso aprovado. A pessoa pode entrar depois de confirmar o e-mail, se necessário.'
          : 'Solicitação recusada. Nenhum acesso foi concedido.',
      );
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const reviewed = requests.filter((r) => r.status !== 'pending');

  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Solicitações de acesso · {pending.length} pendentes</h2>
            <p>Novos cadastros só entram no CRM após a sua aprovação.</p>
          </div>
          <button className="secondary" disabled={loading} onClick={load}>
            Atualizar solicitações
          </button>
        </div>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="success" role="status">
            {message}
          </p>
        )}
        {pending.map((row) => (
          <div className="report-line" key={row.id}>
            <div>
              <strong>{row.name}</strong>
              <p>
                {row.email} · Solicitado em {date(row.created_at)}
              </p>
            </div>
            <div className="row-actions">
              <button disabled={loading} onClick={() => review(row, 'approved')}>
                Aprovar
              </button>
              <button className="secondary" disabled={loading} onClick={() => review(row, 'rejected')}>
                Recusar
              </button>
            </div>
          </div>
        ))}
        {!pending.length && !error && <p role="status">{loading ? 'Carregando solicitações…' : 'Nenhum cadastro aguardando aprovação.'}</p>}
        {reviewed.length > 0 && (
          <details>
            <summary>Histórico de decisões</summary>
            {reviewed.map((row) => (
              <div className="report-line" key={row.id}>
                <span>
                  {row.name} · {row.email}
                </span>
                <span>
                  {row.status === 'approved' ? 'Aprovado' : 'Recusado'} · {date(row.reviewed_at)}
                </span>
              </div>
            ))}
          </details>
        )}
      </section>

      <section className="panel">
        <h2>Equipe e acesso</h2>
        <p>
          Novos leads são distribuídos entre os perfis <strong>comercial</strong> ativos, para quem tem menos leads. Sem comercial ativo, o
          lead fica sem responsável e aparece em “Sem responsável”.
        </p>
        {data.profiles?.map((r) => (
          <div className="report-line" key={r.id}>
            <span>
              {r.name} · {r.role} · {r.active ? 'Ativo' : 'Inativo'}
            </span>
            <button className="secondary" disabled={busy} onClick={() => edit({ entity: 'profiles', row: r })}>
              Editar acesso
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
