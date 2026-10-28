/**
 * Origem do lead para o CRM: UTMs, página de entrada e site de referência.
 *
 * A primeira origem da visita fica no sessionStorage (só nesta aba, sem dado
 * pessoal) e acompanha o envio do formulário junto com a origem atual. URLs
 * vão sem query string; só as UTMs abaixo são lidas.
 */
const KEY = 'couts:first-touch';
const UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function current() {
  const params = new URLSearchParams(window.location.search);
  const touch = { landing_page: window.location.origin + window.location.pathname };
  for (const key of UTMS) {
    const value = params.get(key);
    if (value) touch[key] = value.slice(0, 200);
  }
  try {
    const ref = document.referrer && new URL(document.referrer);
    if (ref && ref.origin !== window.location.origin) touch.referrer = ref.origin + ref.pathname;
  } catch { /* referrer inválido */ }
  return touch;
}

/** Chamado ao carregar qualquer página do site. */
export function rememberFirstTouch() {
  try {
    if (!sessionStorage.getItem(KEY)) sessionStorage.setItem(KEY, JSON.stringify(current()));
  } catch { /* armazenamento bloqueado: vale só a origem atual */ }
}

export function attribution() {
  const last = current();
  let first = last;
  try {
    first = JSON.parse(sessionStorage.getItem(KEY)) || last;
  } catch { /* idem */ }
  return { first, last };
}
