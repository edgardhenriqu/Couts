import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import App from './App.jsx';
import { matchRoute } from './routes.js';
import { initAnalytics, initClickTracking } from './analytics.js';
import './styles.css';

const route = matchRoute(window.location.pathname);
const container = document.getElementById('root');
const app = (
  <StrictMode>
    <App route={route} />
  </StrictMode>
);

// No build, cada página chega com o HTML pronto (prerender) e só é hidratada.
// No `vite dev` o #root vem vazio e o app é montado do zero.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  document.title = route.title;
  createRoot(container).render(app);
}

initAnalytics();
initClickTracking();
