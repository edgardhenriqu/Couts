/**
 * Geração estática (SSG) depois do `vite build`.
 *
 * 1. `vite build` gera o bundle do navegador em dist/ (com dist/index.html
 *    como molde);
 * 2. `vite build --ssr` gera dist-ssr/entry-server.js;
 * 3. este script renderiza cada rota com React e grava um HTML completo por
 *    página — conteúdo, title, description, canonical, Open Graph e JSON-LD
 *    já no HTML, sem depender de JavaScript — além de sitemap.xml e
 *    robots.txt.
 *
 * Saída: /index.html e /404.html (a Vercel serve o 404.html para endereços
 * inexistentes). Novas rotas em src/routes.js geram novos arquivos aqui.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');
const SITE_URL = 'https://www.coutstech.com';

const { render, ROUTES, NOT_FOUND } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);
const template = await readFile(join(dist, 'index.html'), 'utf8');

if (!template.includes('<!--app-head-->') || !template.includes('<!--app-html-->')) {
  throw new Error('dist/index.html sem os marcadores <!--app-head--> / <!--app-html-->.');
}

const fileFor = (path) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);

for (const route of [...ROUTES, NOT_FOUND]) {
  const { head, html } = render(route);
  const page = template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);
  const file = join(dist, route === NOT_FOUND ? '404.html' : fileFor(route.path));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page);
  console.log(`prerender  ${route.path.padEnd(48)} → ${file.slice(dist.length + 1)}`);
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
).join('\n')}
</urlset>
`;
await writeFile(join(dist, 'sitemap.xml'), sitemap);

const robots = `# COUTS — https://www.coutstech.com
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
await writeFile(join(dist, 'robots.txt'), robots);

await rm(ssrDir, { recursive: true, force: true });
console.log(`sitemap.xml (${ROUTES.length} URLs) e robots.txt gerados.`);
