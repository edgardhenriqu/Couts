import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { all, api, date, lookup } from './api.js';
import Activities from './Activities.jsx';

/** Detalhe do lead: dados de contato, atividades e mensagens do formulário. */
export default function LeadDetail({ row, data, role, busy, edit, onClose, refresh, setError, ...rest }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    setMessages([]);
    setLoading(true);
    all('interactions', { contact_id: row.id })
      .then((rows) => current && setMessages(rows))
      .catch((e) => current && setError(e.message))
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
  }, [row.id, setError]);

  async function remove() {
    if (!window.confirm('Excluir este lead e todos os registros vinculados (atividades e mensagens)? Esta operação não pode ser desfeita.')) return;
    try {
      await api('crm/contacts', 'DELETE', { id: row.id });
      onClose();
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  const fields = [
    ['E-mail', row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : ''],
    ['Telefone', row.phone],
    ['Empresa', lookup(data, 'companies', row.company_id, '')],
    ['Responsável', lookup(data, 'profiles', row.owner_id)],
    ['Interesse', row.interest],
    ['Origem', row.source],
    ['Recebido em', date(row.created_at)],
    ['Atendimento', row.first_contact_at ? `Contatado em ${date(row.first_contact_at)}` : 'A contatar'],
    ['Observações', row.notes],
  ];

  return (
    <>
      <button className="secondary" onClick={onClose}>
        ← Voltar aos leads
      </button>
      <div className="detail-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Dados do lead</h2>
            <button disabled={busy} onClick={() => edit({ entity: 'contacts', row })}>
              Editar contato
            </button>
          </div>
          <dl>
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || '—'}</dd>
              </div>
            ))}
          </dl>
          {role === 'admin' && (
            <button className="danger" disabled={busy} onClick={remove}>
              Excluir lead
            </button>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Atendimento</h2>
            <button disabled={busy} onClick={() => edit({ entity: 'activities', contactId: row.id })}>
              <Plus size={15} /> Nova atividade
            </button>
          </div>
          <p>Registre uma ligação, e-mail ou reunião e marque como concluída para atualizar o atendimento do lead.</p>
          <Activities data={data} role={role} busy={busy} edit={edit} contactId={row.id} refresh={refresh} setError={setError} {...rest} />

          <h3>Mensagens recebidas</h3>
          {loading ? (
            <p role="status">Carregando mensagens…</p>
          ) : !messages.length ? (
            <p>Nenhuma mensagem recebida.</p>
          ) : (
            messages.map((m) => (
              <article className="timeline" key={m.id}>
                <small>
                  {date(m.created_at)} · Formulário do site{m.interest ? ` · ${m.interest}` : ''}
                  {m.duplicate ? ' · novo envio' : ''}
                </small>
                <p>{m.message || 'Solicitação sem mensagem adicional.'}</p>
              </article>
            ))
          )}
        </section>
      </div>
    </>
  );
}
