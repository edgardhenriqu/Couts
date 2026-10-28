/** Chamadas do painel para `api/` e formatação comum. */

export const date = (s) => (s ? new Date(s).toLocaleString('pt-BR') : '—');

export async function api(path, method = 'GET', data) {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: method !== 'GET' ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || 'Falha na solicitação');
    error.status = response.status;
    error.code = result.code;
    throw error;
  }
  return result;
}

/** Todos os registros autorizados de uma entidade, em lotes de 1.000. */
export async function all(entity, params = {}) {
  let rows = [];
  for (let page = 0; ; page++) {
    const result = await api(`crm/${entity}?${new URLSearchParams({ ...params, size: '1000', page: String(page) })}`);
    rows = rows.concat(result.data);
    if (rows.length >= result.count || !result.data.length) return rows;
  }
}

/** Nome de um registro por id, a partir do que o painel já carregou. */
export const lookup = (data, entity, id, fallback = 'Não atribuído') =>
  data[entity]?.find((r) => r.id === id)?.name || fallback;
