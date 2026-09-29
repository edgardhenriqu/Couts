import Eyebrow from './Eyebrow.jsx';
import Reveal, { stagger } from './Reveal.jsx';
import { FAQ } from '../data.js';

/** Perguntas frequentes em `<details>`: abre e fecha sem JS e é indexável. */
export default function Faq() {
  return (
    <section className="section section--alt" id="perguntas-frequentes" aria-labelledby="faq-title">
      <div className="wrap wrap--narrow faq">
        <Reveal duration={0.75}>
          <div>
            <Eyebrow>06 — Perguntas frequentes</Eyebrow>
            <h2 className="h2 h2--tight" id="faq-title">
              Dúvidas sobre os treinamentos
            </h2>
          </div>
        </Reveal>

        <div className="faq__list">
          {FAQ.map(({ q, a }, i) => (
            <Reveal key={q} delay={stagger(Math.min(i, 5), 0.08, 0.1)} distance={20}>
              <details className="faq__item">
                <summary>
                  <h3 className="faq__q">{q}</h3>
                  <span className="faq__icon" aria-hidden="true" />
                </summary>
                <p className="faq__a">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
