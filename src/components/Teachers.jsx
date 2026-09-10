import Eyebrow from './Eyebrow.jsx';
import { FELIPE } from '../felipe.js';
import './Teachers.css';

export default function Teachers() {
  return (
    <section className="section teachers" id="professores" aria-labelledby="teachers-title">
      <div className="wrap wrap--narrow">
        <header className="profile-intro">
          <Eyebrow>06 — Professores</Eyebrow>
          <h2 id="teachers-title">Conheça nossos professores</h2>
          <span className="profile-intro__rule" aria-hidden="true" />
        </header>

        <article className="profile-card" aria-labelledby="profile-name">
          <div className="profile-identity">
            {FELIPE.portrait ? (
              <img className="profile-portrait" src={FELIPE.portrait} alt="Felipe Coutinho" width={400} height={400} loading="lazy" decoding="async" />
            ) : (
              <div className="profile-monogram" aria-hidden="true">
                <span>{FELIPE.initials}</span>
                <span className="profile-monogram__name">Felipe Coutinho</span>
              </div>
            )}
            <p className="profile-identity__caption">Learn. Connect. Build.</p>
          </div>

          <div className="profile-content">
            <h3 id="profile-name">{FELIPE.name}</h3>
            <p className="profile-affiliation">{FELIPE.affiliation}</p>
            <p className="profile-bio">{FELIPE.bio}</p>

            <ul className="profile-highlights" aria-label="Destaques da trajetória">
              {FELIPE.highlights.map((highlight) => (
                <li key={highlight}><span aria-hidden="true">✓</span>{highlight}</li>
              ))}
            </ul>

            <a className="profile-linkedin" href={FELIPE.linkedin} target="_blank" rel="noopener noreferrer">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42ZM19 18.75h-2.95V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.76V9.2h2.83v1.3h.04c.39-.75 1.36-1.55 2.79-1.55 2.99 0 3.58 1.97 3.58 4.53v5.27Z" />
              </svg>
              Ver perfil no LinkedIn
              <span aria-hidden="true">↗</span>
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        </article>

        <div className="profile-details">
          {FELIPE.details.map(({ id, title, entries }) => (
            <section className="profile-detail" key={id} aria-labelledby={`profile-${id}`}>
              <h3 className="profile-detail__title" id={`profile-${id}`}>{title}</h3>
              <ul>
                {entries.map((entry) => (
                  <li key={entry.title}>
                    <h4 className="profile-detail__entry">{entry.title}</h4>
                    <p>{entry.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
