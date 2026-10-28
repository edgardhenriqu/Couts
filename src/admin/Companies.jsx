import { useState } from 'react';

import { api } from './api.js';

/** Aba Empresas. Gestor e admin editam; só o admin exclui. */
export default function Companies({ data, role, busy, edit, refresh, setError }) {
  const [deleting, setDeleting] = useState(false);

  async function remove(company) {
    if (!window.confirm(`Excluir a empresa ${company.name}? Os leads vinculados são preservados, mas ficam sem empresa. Esta operação não pode ser desfeita.`)) return;
    setDeleting(true);
    try {
      await api('crm/companies', 'DELETE', { id: company.id });
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="panel">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Domínio</th>
              <th>Leads vinculados</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.companies?.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.name}
                  <small>{r.notes}</small>
                </td>
                <td>{r.domain || '—'}</td>
                <td>{data.contacts?.filter((c) => c.company_id === r.id).length || 0}</td>
                <td>
                  <div className="row-actions">
                    <button className="secondary" disabled={busy || role === 'comercial'} onClick={() => edit({ entity: 'companies', row: r })}>
                      Editar
                    </button>
                    {role === 'admin' && (
                      <button className="danger" disabled={busy || deleting} onClick={() => remove(r)}>
                        Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!data.companies?.length && <div className="empty">Nenhuma empresa cadastrada. Empresas informadas no formulário entram aqui automaticamente.</div>}
    </section>
  );
}
