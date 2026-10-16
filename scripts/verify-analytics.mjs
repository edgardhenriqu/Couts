import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/analytics.js', import.meta.url), 'utf8');
function setup(id = 'G-TEST123') {
  const saved = new Map();
  const scripts = [];
  const listeners = [];
  const context = vm.createContext({
    URL, Date,
    localStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) },
    window: { location: { origin: 'https://example.com', pathname: '/', hostname: 'example.com' } },
    document: { referrer: '', cookie: '', createElement: () => ({}), head: { appendChild: el => scripts.push(el) }, addEventListener: (...args) => listeners.push(args) },
  });
  vm.runInContext(source.replace('import.meta.env.VITE_GA_MEASUREMENT_ID', JSON.stringify(id)).replaceAll('export ', ''), context);
  return { context, scripts, listeners, run: code => vm.runInContext(code, context) };
}
const a = setup();
a.run('initAnalytics(); track("cta_click")');
assert.equal(a.scripts.length, 0, 'No analytics before consent');
a.run('setAnalyticsConsent("denied"); track("cta_click")');
assert.equal(a.scripts.length, 0, 'No analytics after refusal');
a.run('setAnalyticsConsent("granted"); initAnalytics(); initClickTracking(); initClickTracking()');
assert.equal(a.scripts.length, 1, 'One script after consent');
assert.equal(a.listeners.length, 1, 'No duplicate click listeners');
a.run('track("generate_lead", { interest: "ADAS", email: "private@example.com", link_url: "mailto:private@example.com" })');
const event = Array.from(a.context.window.dataLayer.at(-1));
assert.equal(event[1], 'generate_lead');
assert.deepEqual(Object.keys(event[2]), ['interest'], 'PII and URLs excluded');
const before = a.context.window.dataLayer.length;
a.run('setAnalyticsConsent("denied"); track("cta_click")');
assert.equal(a.context.window.dataLayer.length, before, 'Revocation stops events');
assert.equal(a.context.window['ga-disable-G-TEST123'], true);
const b = setup('');
b.run('setAnalyticsConsent("granted"); track("cta_click")');
assert.equal(b.scripts.length, 0, 'No invented measurement ID');
const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
for (const code of ['01', '02', '03', '04']) assert.ok(home.includes(`href="#contato-${code}"`));
assert.ok(home.includes('href="/privacidade"'));
const privacy = readFileSync(new URL('../dist/privacidade.html', import.meta.url), 'utf8');
assert.ok(privacy.includes('Política de Privacidade'));
assert.ok(privacy.includes('https://www.coutstech.com/privacidade'));
console.log('OK: consentimento, recusa, revogação, eventos sem PII, inicialização única e HTML das páginas.');
