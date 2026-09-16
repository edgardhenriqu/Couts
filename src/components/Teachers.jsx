import Eyebrow from './Eyebrow.jsx';
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
          <Eyebrow>05 — Quem está por trás</Eyebrow>

          <h2 className="founder__title" id="founder-title">
            Experiência construída <span>dentro da indústria automotiva</span>
          </h2>

          <p className="founder__intro">{FELIPE.intro}</p>

          <ul className="founder__list">
            {FELIPE.highlights.map((highlight) => (
              <li key={highlight}>
                <CheckIcon />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <img
          className="founder__photo"
          src={FELIPE.photo}
          alt={FELIPE.photoAlt}
          width={1072}
          height={941}
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}
