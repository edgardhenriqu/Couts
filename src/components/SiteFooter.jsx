import Logo from './Logo.jsx';
import { SOCIALS } from '../data.js';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__top">
        <div className="site-footer__brand">
          <span className="logo logo--footer">
            <Logo />
          </span>
          <span className="site-footer__tagline">Learn. Connect. Build.</span>
        </div>

        <nav className="socials" aria-label="Redes sociais">
          {SOCIALS.map((name) => (
            <a key={name} href="#contato">
              {name}
            </a>
          ))}
        </nav>
      </div>

      <div className="wrap site-footer__bottom">
        <span>© 2026 COUTS. Todos os direitos reservados.</span>
        <span className="site-footer__mono">Engenharia automotiva aplicada</span>
      </div>
    </footer>
  );
}
