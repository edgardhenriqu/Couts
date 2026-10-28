/**
 * Plugin do `vite dev` que imita a Vercel para o CRM:
 *
 * - /api/* executa o arquivo correspondente em api/ (handlers GET/POST/...
 *   com Request/Response, os mesmos da produção), recarregado a cada edição;
 * - /auth/callback vai para api/auth/callback.js;
 * - /login e /admin/crm servem admin.html.
 *
 * As rotas e rewrites de produção ficam em vercel.json; mantenha os dois iguais.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const PANEL = new Set(['/login', '/admin', '/admin/crm']);

/** `crm/contacts` → `api/crm/[entity].js`; `auth` → `api/auth/index.js`. */
function resolveApi(path) {
  const parts = path.split('/').filter(Boolean);
  const candidates = [`${parts.join('/')}.js`, `${parts.join('/')}/index.js`];
  for (const file of candidates) if (existsSync(join(root, 'api', file))) return `/api/${file}`;
  const dir = join(root, 'api', ...parts.slice(0, -1));
  const dynamic = existsSync(dir) && readdirSync(dir).find((f) => /^\[.+\]\.js$/.test(f));
  return dynamic ? `/api/${[...parts.slice(0, -1), dynamic].join('/')}` : null;
}

async function toRequest(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }
  let body;
  if (!['GET', 'HEAD'].includes(req.method)) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }
  return new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers, body });
}

async function send(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key !== 'set-cookie') res.setHeader(key, value);
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
  res.end(Buffer.from(await response.arrayBuffer()));
}

export function devApi(env) {
  return {
    name: 'couts-dev-api',
    apply: 'serve',
    configureServer(server) {
      for (const [key, value] of Object.entries(env)) if (!(key in process.env)) process.env[key] = value;

      server.middlewares.use(async (req, res, next) => {
        const { pathname } = new URL(req.url, 'http://localhost');
        const clean = pathname.replace(/\/+$/, '') || '/';

        if (PANEL.has(clean)) {
          req.url = '/admin.html';
          return next();
        }

        const apiPath = clean === '/auth/callback' ? 'auth/callback' : clean.startsWith('/api/') ? clean.slice(5) : null;
        if (apiPath === null) return next();

        const file = resolveApi(apiPath);
        if (!file) return send(res, Response.json({ error: 'Rota não encontrada' }, { status: 404 }));
        try {
          const mod = await server.ssrLoadModule(file);
          const handler = mod[req.method];
          if (!handler) return send(res, new Response(null, { status: 405 }));
          return send(res, await handler(await toRequest(req)));
        } catch (error) {
          server.config.logger.error(`[api] ${req.method} ${pathname}: ${error.stack || error}`);
          return send(res, Response.json({ error: 'Erro interno' }, { status: 500 }));
        }
      });
    },
  };
}
