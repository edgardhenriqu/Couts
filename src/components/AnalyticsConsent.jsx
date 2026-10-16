import { useEffect, useState } from 'react';
import { analyticsConfigured, getAnalyticsConsent, setAnalyticsConsent } from '../analytics.js';

export default function AnalyticsConsent() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(analyticsConfigured && !getAnalyticsConsent());
    const show = () => setOpen(true);
    window.addEventListener('couts:privacy-settings', show);
    return () => window.removeEventListener('couts:privacy-settings', show);
  }, []);
  const choose = (value) => {
    setAnalyticsConsent(value);
    setOpen(false);
  };
  if (!open) return null;
  return (
    <aside className="analytics-consent" aria-label="Preferências de métricas">
      <p>Podemos usar cookies opcionais do Google Analytics para entender as visitas e melhorar os treinamentos? <a href="/privacidade">Política de Privacidade</a></p>
      {!analyticsConfigured && <p>As métricas ainda não estão configuradas neste site.</p>}
      <div className="analytics-consent__actions">
        <button className="btn btn--ghost" type="button" onClick={() => choose('denied')}>Recusar métricas</button>
        <button className="btn btn--ghost" type="button" onClick={() => choose('granted')}>Aceitar métricas</button>
      </div>
    </aside>
  );
}
