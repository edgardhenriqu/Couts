import Logo from './Logo.jsx';
import { TECHS, trainingHref } from '../data.js';
import { CONTACT, SITE, SOCIAL_LINKS } from '../site.js';

export default function SiteFooter({ contactHref = '#contato' }) {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__top">
        <div className="site-footer__brand">
          <a className="logo logo--footer" href="/" aria-label="COUTS — página inicial">
            <Logo alt="" />
          </a>
          <span className="site-footer__tagline">{SITE.motto}</span>
        </div>

        <nav className="site-footer__nav" aria-label="Treinamentos">
          <p className="site-footer__heading">Treinamentos</p>
          <ul>
            {TECHS.map((tech) => (
              <li key={tech.code}>
                <a href={trainingHref(tech)}>{tech.short}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__nav">
          <p className="site-footer__heading">Contato</p>
          <ul>
            <li>
              <a href={contactHref} data-track="contact_click">
                Fale com a COUTS
              </a>
            </li>
            {CONTACT.email && (
              <li>
                <a href={`mailto:${CONTACT.email}`} data-track="email_click">
                  {CONTACT.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Só aparecem perfis com endereço configurado em `src/site.js`. */}
        {SOCIAL_LINKS.length > 0 && (
          <nav className="socials" aria-label="Redes sociais">
            {SOCIAL_LINKS.map(({ name, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                data-track={name === 'WhatsApp' ? 'whatsapp_click' : 'social_click'}
                data-track-label={name}
              >
                {name}
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="wrap site-footer__bottom">
        <span>© {__BUILD_YEAR__} COUTS. Todos os direitos reservados.</span>
        <span className="site-footer__mono">{SITE.slogan}</span>
      </div>
    </footer>
  );
}
