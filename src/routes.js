/**
 * Rotas do site e metadados de cada página (title, description, canonical,
 * Open Graph e JSON-LD).
 *
 * Usado nos dois lados: `entry-server.jsx` gera o HTML estático de cada rota
 * no build, e `main.jsx` escolhe a página a hidratar pelo `pathname`.
 */
import { FAQ, TECHS } from './data.js';
import { FELIPE } from './felipe.js';
import { CONTACT, SITE, SOCIAL_LINKS, absoluteUrl } from './site.js';
import { HERO_POSTER } from './components/Hero.jsx';

import logo from './assets/logo-couts-512.webp';

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;
const PERSON_ID = `${SITE.url}/#felipe-coutinho`;

const HOME_DESCRIPTION =
  'Treinamentos em ADAS, diagnóstico, eletrônica e arquitetura E/E automotiva, baseados em experiência real de desenvolvimento, testes e validação na indústria.';

const organization = {
  '@type': 'EducationalOrganization',
  '@id': ORG_ID,
  name: SITE.name,
  alternateName: SITE.alternateName,
  url: `${SITE.url}/`,
  logo: { '@type': 'ImageObject', url: absoluteUrl(logo), width: 512, height: 512 },
  image: absoluteUrl(SITE.ogImage),
  slogan: SITE.slogan,
  description:
    'A COUTS oferece treinamentos técnicos em tecnologias automotivas — ADAS, diagnóstico automotivo, eletrônica automotiva e arquitetura eletrônica do veículo — desenvolvidos a partir de experiências reais em desenvolvimento, testes e validação na indústria.',
  knowsAbout: [
    'Engenharia automotiva',
    'ADAS',
    'Diagnóstico automotivo',
    'Eletrônica automotiva',
    'Arquitetura eletrônica veicular',
    'Rede CAN',
    'ECUs automotivas',
  ],
  ...(CONTACT.email && { email: CONTACT.email }),
  ...(SOCIAL_LINKS.length && { sameAs: SOCIAL_LINKS.map((s) => s.url) }),
};

const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE.url}/`,
  name: SITE.name,
  alternateName: SITE.alternateName,
  inLanguage: SITE.language,
  publisher: { '@id': ORG_ID },
};

/**
 * Trajetória profissional de Felipe. As empresas ficam fora do schema de
 * propósito: são experiência profissional dele, não clientes da COUTS.
 */
const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: FELIPE.name,
  image: absoluteUrl(FELIPE.portrait),
  url: `${SITE.url}/#professores`,
  sameAs: [FELIPE.linkedin],
  memberOf: { '@id': ORG_ID },
  knowsAbout: [
    'ADAS',
    'Eletrônica automotiva',
    'Diagnóstico automotivo',
    'Infotainment',
    'Redes veiculares',
    'CAN',
    'Testes e validação de sistemas automotivos',
  ],
};

/** Cada treinamento, descrito na seção #treinamentos da página inicial. */
const course = (tech) => ({
  '@type': 'Course',
  '@id': `${SITE.url}/#curso-${tech.code}`,
  name: tech.title,
  description: tech.desc,
  url: `${SITE.url}/#tab-${tech.code}`,
  image: absoluteUrl(tech.banner),
  inLanguage: SITE.language,
  provider: { '@id': ORG_ID },
  teaches: tech.topics.map((t) => t.label),
});

const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

export const ROUTES = [
  {
    path: '/',
    page: 'home',
    title: 'COUTS | Treinamentos em Engenharia Automotiva Aplicada',
    description: HOME_DESCRIPTION,
    preloadImage: HERO_POSTER,
    changefreq: 'monthly',
    priority: '1.0',
    jsonLd: graph(
      organization,
      website,
      person,
      {
        '@type': 'WebPage',
        '@id': `${SITE.url}/#webpage`,
        url: `${SITE.url}/`,
        name: 'COUTS | Treinamentos em Engenharia Automotiva Aplicada',
        description: HOME_DESCRIPTION,
        inLanguage: SITE.language,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORG_ID },
      },
      {
        '@type': 'ItemList',
        name: 'Treinamentos COUTS',
        itemListElement: TECHS.map((tech, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: course(tech),
        })),
      },
      // FAQ visível na página inicial (seção #perguntas-frequentes).
      {
        '@type': 'FAQPage',
        '@id': `${SITE.url}/#faq`,
        mainEntity: FAQ.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ),
  },
];

export const NOT_FOUND = {
  path: '/404',
  page: 'not-found',
  title: 'Página não encontrada | COUTS',
  description: 'A página procurada não existe. Conheça os treinamentos da COUTS em engenharia automotiva aplicada.',
  noindex: true,
};

/** `/treinamentos/adas/`, `/treinamentos/adas.html` e `/index.html` → rota. */
export function matchRoute(pathname) {
  const clean = pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/(.)\/+$/, '$1') || '/';
  return ROUTES.find((r) => r.path === clean) || NOT_FOUND;
}

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `<script type="application/ld+json">` seguro: `<` escapado dentro do JSON. */
const jsonLdTag = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

/** Tags do `<head>` de uma rota (entram no lugar de `<!--app-head-->`). */
export function renderHead(route) {
  const canonical = route.noindex ? null : absoluteUrl(route.path);
  const ogImage = absoluteUrl(route.ogImage || SITE.ogImage);
  const ogSize = route.ogImageSize || { width: 1200, height: 630 };
  const ogAlt = route.ogImageAlt || SITE.ogImageAlt;
  const e = escapeHtml;

  return [
    `<title>${e(route.title)}</title>`,
    `<meta name="description" content="${e(route.description)}" />`,
    `<meta name="robots" content="${route.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}" />`,
    canonical && `<link rel="canonical" href="${canonical}" />`,
    canonical && `<link rel="alternate" hreflang="pt-BR" href="${canonical}" />`,
    route.preloadImage &&
      `<link rel="preload" as="image" href="${route.preloadImage}" fetchpriority="high" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:locale" content="${SITE.locale}" />`,
    `<meta property="og:title" content="${e(route.title)}" />`,
    `<meta property="og:description" content="${e(route.description)}" />`,
    canonical && `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:image:secure_url" content="${ogImage}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="${ogSize.width}" />`,
    `<meta property="og:image:height" content="${ogSize.height}" />`,
    `<meta property="og:image:alt" content="${e(ogAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${e(route.title)}" />`,
    `<meta name="twitter:description" content="${e(route.description)}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
    `<meta name="twitter:image:alt" content="${e(ogAlt)}" />`,
    route.jsonLd && jsonLdTag(route.jsonLd),
  ]
    .filter(Boolean)
    .join('\n');
}
