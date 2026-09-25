import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';

import App from './App.jsx';
import { NOT_FOUND, ROUTES, renderHead } from './routes.js';

export { ROUTES, NOT_FOUND };

/** HTML do `<head>` e do `#root` de uma rota, usado no build estático. */
export function render(route) {
  return {
    head: renderHead(route),
    html: renderToString(
      <StrictMode>
        <App route={route} />
      </StrictMode>,
    ),
  };
}
