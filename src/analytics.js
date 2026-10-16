/** GA4 opcional: só carrega após consentimento, sem dados do formulário. */
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
export const analyticsConfigured = /^G-[A-Z0-9]+$/.test(MEASUREMENT_ID);
const CONSENT_KEY = 'couts:analytics-consent:v1';
let memoryConsent = '';
let clickTrackingInitialized = false;
const PARAMS = new Set(['label', 'interest', 'method', 'field', 'page_path']);

export function getAnalyticsConsent() {
  try { return localStorage.getItem(CONSENT_KEY) || memoryConsent; }
  catch { return memoryConsent; }
}

export function track(event, params = {}, onComplete) {
  if (typeof window === 'undefined' || getAnalyticsConsent() !== 'granted' || !analyticsConfigured) {
    onComplete?.();
    return;
  }
  initAnalytics();
  const safe = Object.fromEntries(Object.entries(params).filter(([key]) => PARAMS.has(key)));
  if (onComplete) {
    safe.event_callback = onComplete;
    safe.event_timeout = 1000;
  }
  window.gtag('event', event, safe);
}

export function initAnalytics() {
  if (typeof window === 'undefined' || !analyticsConfigured || getAnalyticsConsent() !== 'granted' || window.gtag) return;
  window[`ga-disable-${MEASUREMENT_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    page_location: window.location.origin + window.location.pathname,
    page_referrer: document.referrer ? new URL(document.referrer).origin : '',
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement('script');
  script.id = 'couts-analytics';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function setAnalyticsConsent(value) {
  if (!['granted', 'denied'].includes(value)) return;
  memoryConsent = value;
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Escolha vale nesta página. */ }
  if (value === 'granted') {
    window[`ga-disable-${MEASUREMENT_ID}`] = false;
    initAnalytics();
  } else {
    window[`ga-disable-${MEASUREMENT_ID}`] = true;
    // Remove cookies GA acessíveis em host/subdomínios e impede novos envios.
    const host = window.location.hostname.split('.');
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      document.cookie = `${name}=; Max-Age=0; path=/`;
      for (let i = 0; i < host.length - 1; i++) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${host.slice(i).join('.')}`;
      }
    }
  }
}

export function initClickTracking() {
  if (typeof document === 'undefined' || clickTrackingInitialized) return;
  clickTrackingInitialized = true;
  document.addEventListener('click', (e) => {
    const el = e.target.closest?.('[data-track]');
    if (!el) return;
    track(el.dataset.track, {
      label: el.dataset.trackLabel || el.textContent.trim().slice(0, 80),
      page_path: window.location.pathname,
    });
  });
}
