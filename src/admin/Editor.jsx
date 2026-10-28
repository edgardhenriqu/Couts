import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { ACTIVITY_KINDS, ROLES } from './constants.js';

function Field({ label, wide, children }) {
  return (
    <label className={wide ? 'wide' : undefined}>
      {label}
      {children}
    </label>
  );
}

/** ISO → valor de `<input type="datetime-local">` no fuso do navegador. */
const localTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function title(editor) {
  if (editor.entity === 'activities') {
    if (editor.mode === 'complete') return 'Concluir atividade';
    if (editor.mode === 'performed') return 'Registrar atendimento realizado';
    return editor.row ? 'Editar atividade' : 'Nova atividade';
  }
  const noun = { contacts: 'contato', companies: 'empresa', profiles: 'acesso' }[editor.entity];
  return `${editor.row ? 'Editar' : 'Nova'} ${noun}`;
}

/** Modal de criação/edição de lead, atividade, empresa e perfil. */
export default function Editor({ editor, data, selected, role, userId, busy, error, save, close }) {
  const ref = useRef(null);
  const { entity, row } = editor;
  const [performed, setPerformed] = useState(!!row?.completed_at || !!editor.mode);
  const [completionTime] = useState(() => row?.completed_at || new Date().toISOString());

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    for (const k of ['owner_id', 'company_id']) if (k in values) values[k] = values[k] || null;
    for (const k of ['due_at', 'completed_at']) if (k in values) values[k] = values[k] ? new Date(values[k]).toISOString() : null;
    if ('active' in values) values.active = values.active === 'true';

    if (entity === 'activities') {
      // A atividade segue o responsável do lead; a realizada mantém quem atendeu.
      const contact = data.contacts?.find((c) => c.id === values.contact_id);
      values.owner_id = row && row.contact_id === values.contact_id ? row.owner_id : (contact?.owner_id ?? null);
    }
    if (entity === 'profiles' && !window.confirm('Confirmar a alteração de acesso deste usuário?')) return;
    await save(entity, values, row?.id);
  }

  const contactId = row?.contact_id || editor.contactId || selected?.id || '';

  return (
    <dialog ref={ref} className="modal" onCancel={close} aria-labelledby="editor-title">
      <div className="panel-heading">
        <h2 id="editor-title">{title(editor)}</h2>
        <button className="icon-button" aria-label="Fechar" onClick={close}>
          <X />
        </button>
      </div>
      <form onSubmit={onSubmit}>
        {entity === 'activities' && <p>A atividade fica vinculada ao responsável pelo lead.</p>}
        <div className="form-grid">
          {entity === 'contacts' && (
            <>
              <Field label="Nome">
                <input name="name" required minLength={2} maxLength={120} defaultValue={row?.name || ''} />
              </Field>
              <Field label="E-mail">
                <input name="email" type="email" required maxLength={180} defaultValue={row?.email || ''} />
              </Field>
              <Field label="Telefone">
                <input name="phone" maxLength={40} defaultValue={row?.phone || ''} />
              </Field>
              <Field label="Responsável">
                <select name="owner_id" defaultValue={row ? (row.owner_id ?? '') : userId}>
                  {role !== 'comercial' && <option value="">Sem responsável</option>}
                  {data.profiles
                    ?.filter((p) => (p.active || p.id === row?.owner_id) && (role !== 'comercial' || p.id === userId))
                    .map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </Field>
              {role !== 'comercial' && (
                <Field label="Empresa">
                  <select name="company_id" defaultValue={row?.company_id || ''}>
                    <option value="">Sem empresa</option>
                    {data.companies?.map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </>
          )}

          {['companies', 'profiles'].includes(entity) && (
            <Field label="Nome">
              <input name="name" required minLength={2} maxLength={160} defaultValue={row?.name || ''} />
            </Field>
          )}
          {entity === 'companies' && (
            <Field label="Domínio">
              <input name="domain" maxLength={200} placeholder="empresa.com.br" defaultValue={row?.domain || ''} />
            </Field>
          )}

          {entity === 'activities' && (
            <>
              <Field label="Título">
                <input name="title" required minLength={2} maxLength={300} defaultValue={row?.title || ''} placeholder="Ex.: Retornar contato com o lead" />
              </Field>
              <Field label="Lead">
                <select name="contact_id" required defaultValue={contactId}>
                  <option value="">Selecione</option>
                  {data.contacts?.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name} · {c.email}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo">
                <select name="kind" defaultValue={row?.kind || (editor.mode === 'performed' ? 'Ligação' : 'Tarefa')}>
                  {ACTIVITY_KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label="Situação">
                <select
                  value={performed ? 'done' : 'pending'}
                  disabled={!!row?.completed_at || editor.mode === 'complete'}
                  onChange={(e) => setPerformed(e.target.value === 'done')}
                >
                  <option value="pending">Pendente — agendar atendimento</option>
                  <option value="done">Realizada — guardar no histórico</option>
                </select>
              </Field>
              <Field label="Prazo previsto (opcional)">
                <input name="due_at" type="datetime-local" defaultValue={localTime(row?.due_at)} />
              </Field>
              {performed ? (
                <Field label="Realizada em">
                  <input name="completed_at" type="datetime-local" required defaultValue={localTime(completionTime)} />
                </Field>
              ) : (
                <input type="hidden" name="completed_at" value="" />
              )}
            </>
          )}

          {['contacts', 'companies', 'activities'].includes(entity) && (
            <Field label={entity === 'activities' && performed ? 'Registro do atendimento / resultado' : 'Observações'} wide>
              <textarea
                name="notes"
                maxLength={5000}
                defaultValue={row?.notes || ''}
                placeholder={
                  entity === 'activities'
                    ? performed
                      ? 'Descreva o que foi feito, a resposta do lead e os próximos passos.'
                      : 'O que precisa ser feito neste atendimento?'
                    : undefined
                }
              />
            </Field>
          )}

          {entity === 'profiles' && (
            <>
              <Field label="Perfil">
                <select name="role" defaultValue={row?.role}>
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Ativo">
                <select name="active" defaultValue={String(row?.active ?? true)}>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </Field>
            </>
          )}
        </div>

        {entity === 'activities' && performed && <p>A atividade fica salva no histórico de realizadas, com data e anotações.</p>}
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="button" className="secondary" onClick={close}>
            Cancelar
          </button>
          <button disabled={busy}>{busy ? 'Salvando…' : entity === 'activities' && performed ? 'Salvar no histórico' : 'Salvar alterações'}</button>
        </div>
      </form>
    </dialog>
  );
}
