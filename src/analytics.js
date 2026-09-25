/**
 * Eventos de conversão, prontos para GA4/GTM.
 *
 * Não há ID de medição no projeto. O GA4 só é carregado quando
 * `VITE_GA_MEASUREMENT_ID` existir; até lá os eventos vão apenas para
 * `window.dataLayer`, o que também serve a um contêiner GTM instalado depois.
 *
 * Eventos: cta_click, contact_click, whatsapp_click, email_click,
 * linkedin_click, service_view, form_submit, form_error.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

export function track(event, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') window.gtag('event', event, params);
  else window.dataLayer.push({ event, ...params });
}

/** Carrega o gtag.js depois do `load`, fora do caminho crítico. */
export function initAnalytics() {
  if (!MEASUREMENT_ID || typeof window === 'undefined' || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // O gtag.js exige o objeto `arguments`, não um array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);

  const load = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  };
  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load, { once: true });
}

/**
 * Um único listener para cliques rastreáveis: qualquer elemento com
 * `data-track="evento"` (e, opcionalmente, `data-track-label`).
 */
export function initClickTracking() {
  if (typeof document === 'undefined') return;
  document.addEventListener('click', (e) => {
    const el = e.target.closest?.('[data-track]');
    if (!el) return;
    track(el.dataset.track, {
      label: el.dataset.trackLabel || el.textContent.trim().slice(0, 80),
      link_url: el.getAttribute('href') || undefined,
      page_path: window.location.pathname,
    });
  });
}
