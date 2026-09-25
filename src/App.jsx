import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/**
 * Casca comum às páginas (inicial e 404). Cada rota é um HTML estático
 * próprio, gerado por `scripts/prerender.mjs`.
 */
export default function App({ route }) {
  // Na 404 não há formulário: o "Fale com a equipe" leva ao da página inicial.
  const contactHref = route.page === 'not-found' ? '/#contato' : '#contato';

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>

      <SiteHeader contactHref={contactHref} />

      <main id="conteudo" tabIndex={-1}>
        {route.page === 'home' && <HomePage />}
        {route.page === 'not-found' && <NotFoundPage />}
      </main>

      <SiteFooter contactHref={contactHref} />
    </>
  );
}
