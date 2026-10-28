import { Fragment, useState } from 'react';
import { CheckCircle2, Clock, History, Search } from 'lucide-react';

import { api, date, lookup } from './api.js';

const DESCRIPTIONS = {
  pending: 'Atividades a fazer, ordenadas pelo prazo mais próximo.',
  done: 'Atendimentos concluídos, dos mais recentes para os mais antigos.',
  sequence: 'Histórico cronológico de cada lead, do primeiro registro ao mais recente.',
};

const isLate = (r) => !r.completed_at && r.due_at && Date.parse(r.due_at) < Date.now();

/**
 * Agenda e histórico de atendimento. Na aba Atividades mostra todos os leads;
 * dentro do detalhe de um lead (`contactId`), só os registros dele.
 */
export default function Activities({ data, role, busy, missing = false, edit, openLead, contactId, refresh, setError }) {
  const [view, setView] = useState(contactId ? 'sequence' : 'pending');
  const [query, setQuery] = useState('');
  const [leadFilter, setLeadFilter] = useState(contactId || '');
  const [deleting, setDeleting] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [notice, setNotice] = useState('');

  async function assignLead(lead, ownerId) {
    if (role === 'comercial' || busy || assigning) return;
    setAssigning(lead.id);
    setNotice('');
    try {
      await api('crm/contacts', 'PATCH', { id: lead.id, owner_id: ownerId || null });
      setNotice(`Responsável ${ownerId ? 'atualizado' : 'removido'} para ${lead.name}. As atividades pendentes acompanham essa atribuição.`);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setAssigning(null);
    }
  }

  async function remove(row) {
    if (role !== 'admin' || busy || deleting || missing) return;
    const extra = row.completed_at ? ' Ela será removida do histórico de realizadas.' : '';
    if (!window.confirm(`Excluir a atividade "${row.title}"?${extra} O lead será preservado. Esta operação não pode ser desfeita.`)) return;
    setDeleting(row.id);
    setNotice('');
    try {
      await api('crm/activities', 'DELETE', { id: row.id });
      setNotice('Atividade excluída.');
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  }

  const rows = (data.activities || []).filter((r) => !contactId || r.contact_id === contactId);
  const pending = rows.filter((r) => !r.completed_at);
  const done = rows.filter((r) => r.completed_at);
  const scoped = rows.filter((r) => !leadFilter || r.contact_id === leadFilter);
  const scopedPending = scoped.filter((r) => !r.completed_at);
  const scopedDone = scoped.filter((r) => r.completed_at);
  const leadName = (id) => lookup(data, 'contacts', id, 'Lead');
  const chronological = (a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);
  const sequence = (id) => scoped.filter((r) => r.contact_id === id).sort(chronological);

  const needle = query.toLocaleLowerCase('pt-BR');
  const filtered = scoped
    .filter((r) => view === 'sequence' || (view === 'done' ? !!r.completed_at : !r.completed_at))
    .filter((r) =>
      [r.title, r.notes, r.kind, leadName(r.contact_id), lookup(data, 'profiles', r.owner_id)].join(' ').toLocaleLowerCase('pt-BR').includes(needle),
    )
    .sort((a, b) => {
      if (view === 'sequence') return (leadFilter ? 0 : leadName(a.contact_id).localeCompare(leadName(b.contact_id), 'pt-BR')) || chronological(a, b);
      if (!a.completed_at && !b.completed_at) return (a.due_at || '9999').localeCompare(b.due_at || '9999');
      if (a.completed_at && b.completed_at) return b.completed_at.localeCompare(a.completed_at);
      return a.completed_at ? 1 : -1;
    });

  const emptyText = query
    ? 'Nenhuma atividade corresponde à busca.'
    : view === 'done'
      ? 'Nenhuma atividade realizada para este filtro.'
      : view === 'pending'
        ? 'Nenhuma atividade pendente para este filtro.'
        : 'Nenhuma atividade registrada para este lead.';

  return (
    <section className="activity-board">
      {!contactId && (
        <div className="activity-summary">
          <div>
            <Clock size={20} />
            <span>
              Pendentes<strong>{missing ? '—' : pending.length}</strong>
            </span>
          </div>
          <div>
            <Clock size={20} />
            <span>
              Em atraso<strong>{missing ? '—' : pending.filter(isLate).length}</strong>
            </span>
          </div>
          <div>
            <CheckCircle2 size={20} />
            <span>
              Realizadas<strong>{missing ? '—' : done.length}</strong>
            </span>
          </div>
        </div>
      )}

      <div className={contactId ? '' : 'panel'}>
        {notice && (
          <p className="success" role="status">
            {notice}
          </p>
        )}
        <div className="panel-heading">
          <div>
            <h2>{contactId ? 'Atividades e histórico' : 'Agenda e histórico de atendimento'}</h2>
            <p>Atribua um responsável e acompanhe as etapas e o histórico do lead.</p>
          </div>
          <button
            className="secondary"
            disabled={busy || missing}
            onClick={() => edit({ entity: 'activities', mode: 'performed', contactId: contactId || leadFilter || undefined })}
          >
            <History size={16} /> Registrar realizada
          </button>
        </div>

        <div className="activity-filters">
          <div className="activity-tabs" role="group" aria-label="Filtrar atividades">
            {[
              ['pending', 'Pendentes', scopedPending.length],
              ['done', 'Realizadas', scopedDone.length],
              ['sequence', 'Sequência por lead', scoped.length],
            ].map(([key, label, n]) => (
              <button key={key} aria-pressed={view === key} className={view === key ? '' : 'secondary'} onClick={() => setView(key)}>
                {label} <span>{n}</span>
              </button>
            ))}
          </div>
          <div className="search">
            <Search size={16} aria-hidden="true" />
            <input aria-label="Pesquisar atividades" placeholder="Buscar atividade ou anotação" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {!contactId && (
          <div className="activity-lead-filter">
            <label>
              Lead
              <select value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)}>
                <option value="">Todos os leads</option>
                {data.contacts?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.email}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="activity-view-summary">
          <span>{DESCRIPTIONS[view]}</span>
          <strong>
            {filtered.length} {filtered.length === 1 ? 'atividade exibida' : 'atividades exibidas'}
          </strong>
        </div>

        {filtered.map((r, index) => {
          const late = isLate(r);
          const lead = data.contacts?.find((c) => c.id === r.contact_id);
          const steps = view === 'sequence' ? sequence(r.contact_id) : [];
          const newGroup = view === 'sequence' && (index === 0 || filtered[index - 1].contact_id !== r.contact_id);
          const group = newGroup ? scoped.filter((item) => item.contact_id === r.contact_id) : [];
          const locked = busy || missing || !!deleting;
          return (
            <Fragment key={r.id}>
              {newGroup && (
                <div className="activity-group-heading">
                  <div>
                    {lead && openLead && !contactId ? (
                      <button className="text-button" onClick={() => openLead(lead)}>
                        {lead.name}
                      </button>
                    ) : (
                      <strong>{lead?.name || 'Lead não encontrado'}</strong>
                    )}
                    <span>{lead?.email || ''}</span>
                  </div>
                  <small>
                    {group.filter((item) => !item.completed_at).length} pendente(s) · {group.filter((item) => item.completed_at).length} realizada(s)
                  </small>
                </div>
              )}
              <article className={`activity-card${r.completed_at ? ' is-done' : ''}${view === 'sequence' ? ' is-sequence' : ''}`}>
                <div className="activity-icon">{r.completed_at ? <CheckCircle2 size={20} /> : <Clock size={20} />}</div>
                <div className="activity-content">
                  <div className="activity-title">
                    {steps.length > 1 && (
                      <span className="activity-step">
                        Etapa {steps.findIndex((item) => item.id === r.id) + 1} de {steps.length}
                      </span>
                    )}
                    <h3>{r.title}</h3>
                    <span className={`badge${late ? ' is-late' : r.completed_at ? ' is-done' : ''}`}>
                      {r.completed_at ? 'Realizada' : late ? 'Em atraso' : 'Pendente'}
                    </span>
                  </div>
                  <p className="activity-meta">
                    {r.kind} · {r.completed_at ? 'Responsável pelo atendimento' : 'Responsável'}: {lookup(data, 'profiles', r.owner_id)}
                  </p>
                  {!contactId && view !== 'sequence' && lead && (
                    <button className="text-button" onClick={() => openLead?.(lead)}>
                      {lead.name}
                    </button>
                  )}
                  {lead && role !== 'comercial' && !r.completed_at && (
                    <label className="activity-assignee">
                      Atribuir lead a
                      <select
                        aria-label={`Responsável pelo lead ${lead.name}`}
                        value={lead.owner_id || ''}
                        disabled={busy || !!assigning}
                        onChange={(e) => assignLead(lead, e.target.value)}
                      >
                        <option value="">Sem responsável</option>
                        {data.profiles
                          ?.filter((p) => p.active || p.id === lead.owner_id)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  )}
                  <p>
                    <strong>{r.completed_at ? 'Realizada em: ' : 'Prazo: '}</strong>
                    {r.completed_at ? date(r.completed_at) : r.due_at ? date(r.due_at) : 'Sem prazo definido'}
                  </p>
                  {r.completed_at && r.due_at && <p className="activity-meta">Prazo original: {date(r.due_at)}</p>}
                  <div className="activity-notes">{r.notes || (r.completed_at ? 'Nenhuma anotação registrada.' : 'Sem observações adicionais.')}</div>
                </div>
                <div className="row-actions">
                  <button className="secondary" disabled={locked} onClick={() => edit({ entity: 'activities', row: r })}>
                    {r.completed_at ? 'Editar registro' : 'Editar'}
                  </button>
                  {!r.completed_at && (
                    <button disabled={locked} onClick={() => edit({ entity: 'activities', row: r, mode: 'complete' })}>
                      Concluir e registrar
                    </button>
                  )}
                  {role === 'admin' && (
                    <button className="danger" disabled={locked} aria-label={`Excluir atividade ${r.title}`} onClick={() => remove(r)}>
                      {deleting === r.id ? 'Excluindo…' : 'Excluir'}
                    </button>
                  )}
                </div>
              </article>
            </Fragment>
          );
        })}

        {!filtered.length && (
          <div className="empty">
            <History size={28} />
            <p>{emptyText}</p>
            <small>{query ? 'Tente outro termo ou limpe a pesquisa.' : 'Use “Nova atividade” ou “Registrar realizada” para começar.'}</small>
          </div>
        )}
      </div>
    </section>
  );
}
