import { useEffect, useState } from 'react';

import Logo from './Logo.jsx';
import { NAV_LINKS } from '../data.js';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Esc fecha o menu mobile e devolve o foco ao botão.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        document.querySelector('.nav-toggle')?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="site-header">
      <a className="logo logo--header" href="#hero" aria-label="COUTS — início">
        <Logo />
      </a>

      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav-toggle__bars" aria-hidden="true" />
        <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
      </button>

      <nav
        className={open ? 'site-nav is-open' : 'site-nav'}
        id="site-nav"
        aria-label="Navegação principal"
        onClick={() => setOpen(false)}
      >
        {NAV_LINKS.map(({ href, label }) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
        <a className="site-nav__cta" href="#contato">
          Falar com a equipe
        </a>
      </nav>
    </header>
  );
}
