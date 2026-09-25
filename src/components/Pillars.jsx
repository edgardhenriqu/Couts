import { PILLARS } from '../data.js';

export default function Pillars() {
  return (
    <section className="pillars" aria-labelledby="pillars-title">
      <h2 className="sr-only" id="pillars-title">
        Áreas de treinamento
      </h2>
      {PILLARS.map(({ code, title, note, href }) => (
        <article className="pillar" key={code}>
          <p className="pillar__code">{code}</p>
          <h3 className="pillar__title">
            {/* O `::after` do link cobre o cartão inteiro (ver `.pillar__link`). */}
            <a className="pillar__link" href={href} data-track="service_click" data-track-label={title}>
              {title}
            </a>
          </h3>
          <p className="pillar__note">{note}</p>
        </article>
      ))}
    </section>
  );
}
