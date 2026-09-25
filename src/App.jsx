import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import HomePage from './pages/HomePage.jsx';
import TrainingPage from './pages/TrainingPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/**
 * Casca comum a todas as páginas. Cada rota é um HTML estático próprio
 * (ver `scripts/prerender.mjs`); a navegação entre páginas é por links comuns.
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
        {route.page === 'training' && <TrainingPage tech={route.tech} />}
        {route.page === 'not-found' && <NotFoundPage />}
      </main>

      <SiteFooter contactHref={contactHref} />
    </>
  );
}
