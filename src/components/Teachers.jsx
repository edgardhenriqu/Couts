import Eyebrow from './Eyebrow.jsx';
import Reveal, { stagger } from './Reveal.jsx';
import { FELIPE } from '../felipe.js';
import './Teachers.css';

function CheckIcon() {
  return (
    <svg className="founder__check" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <path d="m6.4 12.4 3.8 3.8 7.4-7.6" fill="none" stroke="var(--accent-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Teachers() {
  return (
    <section className="founder" id="professores" aria-labelledby="founder-title">
      <div className="founder__canvas">
        <div className="founder__content">
          <Reveal direction="left">
            <Eyebrow>05 — Quem está por trás</Eyebrow>
          </Reveal>

          <Reveal direction="left" delay={0.08} duration={0.75}>
            <h2 className="founder__title" id="founder-title">
              Experiência construída <span>dentro da indústria automotiva</span>
            </h2>
          </Reveal>

          <Reveal direction="left" delay={0.16}>
            <p className="founder__name">
              <strong>{FELIPE.name}</strong>
              <a
                href={FELIPE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                data-track="linkedin_click"
                data-track-label={FELIPE.name}
              >
                LinkedIn <span aria-hidden="true">↗</span>
                <span className="sr-only"> de {FELIPE.name} (abre em nova aba)</span>
              </a>
            </p>
          </Reveal>

          <Reveal direction="left" delay={0.24}>
            <p className="founder__intro">{FELIPE.intro}</p>
          </Reveal>

          <ul className="founder__list">
            {FELIPE.highlights.map((highlight, i) => (
              <Reveal key={highlight} delay={stagger(i, 0.08, 0.3)} distance={20}>
                <li>
                  <CheckIcon />
                  <span>{highlight}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal direction="right" delay={0.1} scale={0.97} duration={0.9}>
          <img
            className="founder__photo"
            src={FELIPE.photo}
            srcSet={FELIPE.photoSrcSet}
            sizes="(max-width: 620px) 100vw, (max-width: 1100px) 860px, 65vw"
            alt={FELIPE.photoAlt}
            width={1072}
            height={941}
            loading="lazy"
            decoding="async"
          />
        </Reveal>
      </div>
    </section>
  );
}
