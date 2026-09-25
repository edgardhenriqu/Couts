/**
 * Dados institucionais e canais de contato da COUTS.
 *
 * Tudo aqui aparece no HTML, nos metadados e no JSON-LD. Só entra informação
 * confirmada: canais sem endereço real ficam vazios e simplesmente não são
 * exibidos (nem no rodapé, nem no schema `sameAs`).
 *
 * Variáveis de ambiente (arquivo `.env` ou painel da Vercel) têm prioridade,
 * para que contato e analytics possam ser ligados sem mexer no código.
 */

const env = import.meta.env;

export const SITE = {
  name: 'COUTS',
  alternateName: 'CoutsTech',
  url: 'https://www.coutstech.com',
  slogan: 'Engenharia automotiva aplicada',
  motto: 'Learn. Connect. Build.',
  locale: 'pt_BR',
  language: 'pt-BR',
  themeColor: '#05070A',
  ogImage: '/og-couts.jpg',
  ogImageAlt: 'COUTS — Engenharia automotiva aplicada. Treinamentos em ADAS, diagnóstico, eletrônica e arquitetura E/E.',
};

/**
 * Canais de contato. Preencha quando existirem:
 * - `email`: endereço comercial (ex.: contato@coutstech.com);
 * - `whatsapp`: só dígitos, com DDI e DDD (ex.: 5511999999999).
 */
export const CONTACT = {
  email: env.VITE_CONTACT_EMAIL || '',
  whatsapp: (env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, ''),
  whatsappMessage:
    'Olá! Conheci a COUTS pelo site e gostaria de saber mais sobre os treinamentos.',
  /**
   * Endpoint que recebe o formulário via POST (JSON). Padrão: FormSubmit,
   * que encaminha cada envio para coutstech@gmail.com sem conta nem chave.
   * Na primeira vez o FormSubmit manda um e-mail de ativação para esse
   * endereço; até alguém clicar em "Activate Form", os envios não chegam.
   * `VITE_CONTACT_ENDPOINT` troca por outro serviço ou API própria.
   */
  formEndpoint: env.VITE_CONTACT_ENDPOINT || 'https://formsubmit.co/ajax/coutstech@gmail.com',
};

/** Perfis oficiais. Links vazios não são exibidos. */
export const SOCIAL_LINKS = [
  { name: 'WhatsApp', url: CONTACT.whatsapp ? `https://wa.me/${CONTACT.whatsapp}` : '' },
  { name: 'Instagram', url: env.VITE_INSTAGRAM_URL || '' },
  { name: 'LinkedIn', url: env.VITE_LINKEDIN_URL || '' },
  { name: 'YouTube', url: env.VITE_YOUTUBE_URL || '' },
  { name: 'TikTok', url: env.VITE_TIKTOK_URL || '' },
].filter((link) => link.url);

export const whatsappHref = () =>
  CONTACT.whatsapp
    ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`
    : '';

export const absoluteUrl = (path = '/') => new URL(path, SITE.url).href;
