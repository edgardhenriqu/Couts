import { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';

import { api, date, lookup } from './api.js';
import { exportLeadsWorkbook } from './exportLeads.js';

const PAGE_SIZE = 25;

/** Aba Leads: indicadores, busca, filtro por responsável, tabela e exportação. */
export default function Leads({ data, role, busy, missing, openLead, refresh, setError }) {
  const [leads, setLeads] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState('');
  const [owner, setOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState('');

  // Busca no servidor (nome, e-mail ou empresa), com pequeno atraso ao digitar.
  useEffect(() => {
    if (missing || !data.contacts) return undefined;
    let current = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await api(`crm/contacts?${new URLSearchParams({ q, owner, page: String(page) })}`);
        if (current) {
          setLeads(result.data);
          setCount(result.count);
        }
      } catch (e) {
        if (current) setError(e.message);
      } finally {
        if (current) setLoading(false);
      }
    }, 250);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [missing, data, q, owner, page, setError]);

  const nextActivity = (id) =>
    (data.activities || [])
      .filter((a) => a.contact_id === id && !a.completed_at && a.due_at)
      .sort((a, b) => a.due_at.localeCompare(b.due_at))[0];

  async function deleteLead(row) {
    if (role !== 'admin' || deleting || busy || missing) return;
    if (!window.confirm(`Excluir o lead "${row.name}" e todos os registros vinculados (atividades e mensagens)? Esta operação não pode ser desfeita.`)) return;
    setDeleting(true);
    setNotice('');
    try {
      await api('crm/contacts', 'DELETE', { id: row.id });
      if (leads.length === 1 && page > 0) setPage(page - 1);
      setNotice('Lead excluído.');
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  async function exportLeads() {
    setExporting(true);
    try {
      const rows = [];
      for (let p = 0; ; p++) {
        const result = await api(`crm/contacts?${new URLSearchParams({ q, owner, page: String(p), size: '1000' })}`);
        rows.push(...result.data);
        if (rows.length >= result.count || !result.data.length) break;
      }
      await exportLeadsWorkbook(
        rows.map((r) => ({
          name: r.name || '',
          email: r.email || '',
          phone: r.phone || '',
          company: lookup(data, 'companies', r.company_id, ''),
          interest: r.interest || '',
          source: r.source || '',
          owner: lookup(data, 'profiles', r.owner_id),
          createdAt: r.created_at || null,
          contacted: !!r.first_contact_at,
          notes: r.notes || '',
        })),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  }

  const metrics = [
    ['Leads recebidos', data.contacts?.length],
    ['A contatar', data.contacts?.filter((r) => !r.first_contact_at).length],
    ['Sem responsável', data.contacts?.filter((r) => !r.owner_id).length],
    ['Atividades pendentes', data.activities?.filter((r) => !r.completed_at).length],
  ];
  const columns = ['Contato', 'Empresa / interesse', 'Responsável', 'Recebido em', 'Atendimento', 'Próxima atividade', ...(role === 'admin' ? ['Ações'] : [])];

  return (
    <>
      <div className="metric-grid">
        {metrics.map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{missing ? '—' : (value ?? '—')}</strong>
          </div>
        ))}
      </div>

      <section className="panel">
        {notice && (
          <p className="success" role="status">
            {notice}
          </p>
        )}
        <div className="filter-bar">
          <div className="search">
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="Pesquisar leads"
              placeholder="Nome, empresa ou e-mail"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <select
            aria-label="Responsável"
            value={owner}
            onChange={(e) => {
              setOwner(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todos os responsáveis</option>
            {data.profiles?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button className="secondary" disabled={missing || exporting || !data.contacts} onClick={exportLeads}>
            <Download size={15} />
            {exporting ? 'Exportando…' : 'Exportar contatos'}
          </button>
        </div>

        <div className="table-scroll" aria-busy={loading}>
          <table>
            <thead>
              <tr>
                {columns.map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading &&
                leads.map((r) => {
                  const next = nextActivity(r.id);
                  return (
                    <tr key={r.id}>
                      <td>
                        <button className="text-button" onClick={() => openLead(r)}>
                          {r.name}
                        </button>
                        <small>{r.email}</small>
                        <small>{r.phone}</small>
                      </td>
                      <td>
                        {lookup(data, 'companies', r.company_id, 'Sem empresa')}
                        <small>{r.interest || 'Interesse não informado'}</small>
                      </td>
                      <td>{lookup(data, 'profiles', r.owner_id)}</td>
                      <td>
                        {date(r.created_at)}
                        <small>{r.source}</small>
                      </td>
                      <td>
                        <span className={`badge${r.first_contact_at ? ' is-done' : ''}`}>{r.first_contact_at ? 'Contatado' : 'A contatar'}</span>
                      </td>
                      <td>
                        {next?.title || 'Sem atividade'}
                        <small>{next ? date(next.due_at) : ''}</small>
                      </td>
                      {role === 'admin' && (
                        <td>
                          <button className="danger" disabled={busy || deleting || missing} aria-label={`Excluir lead ${r.name}`} onClick={() => deleteLead(r)}>
                            Excluir
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {loading ? (
            <div className="empty" role="status">
              Carregando leads…
            </div>
          ) : (
            !leads.length && (
              <div className="empty">{q || owner ? 'Nenhum lead encontrado com esses filtros.' : 'Os contatos enviados pelo formulário do site aparecerão aqui.'}</div>
            )
          )}
        </div>

        <div className="pagination">
          <span>
            {count} leads · página {page + 1}
          </span>
          <button className="secondary" disabled={page === 0 || loading} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <button className="secondary" disabled={(page + 1) * PAGE_SIZE >= count || loading} onClick={() => setPage(page + 1)}>
            Próxima
          </button>
        </div>
      </section>
    </>
  );
}
