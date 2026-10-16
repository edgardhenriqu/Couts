import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import useScrollReveal from './hooks/useScrollReveal.js';
import PrivacyPage from './pages/PrivacyPage.jsx';
import AnalyticsConsent from './components/AnalyticsConsent.jsx';
import ThankYouPage from './pages/ThankYouPage.jsx';

/**
 * Casca comum às páginas (inicial e 404). Cada rota é um HTML estático
 * próprio, gerado por `scripts/prerender.mjs`.
 */
export default function App({ route }) {
  useScrollReveal();

  // Na 404 não há formulário: o "Fale com a equipe" leva ao da página inicial.
  const contactHref = route.page === 'home' ? '#contato' : '/#contato';

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>

      <SiteHeader contactHref={contactHref} />

      <main id="conteudo" tabIndex={-1}>
        {route.page === 'home' && <HomePage />}
        {route.page === 'not-found' && <NotFoundPage />}
        {route.page === 'privacy' && <PrivacyPage />}
        {route.page === 'thank-you' && <ThankYouPage />}
      </main>

      <SiteFooter contactHref={contactHref} />
      <AnalyticsConsent />
    </>
  );
}
