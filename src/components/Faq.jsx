import Eyebrow from './Eyebrow.jsx';
import { FAQ } from '../data.js';

/** Perguntas frequentes em `<details>`: abre e fecha sem JS e é indexável. */
export default function Faq() {
  return (
    <section className="section section--alt" id="perguntas-frequentes" aria-labelledby="faq-title">
      <div className="wrap wrap--narrow faq">
        <div>
          <Eyebrow>06 — Perguntas frequentes</Eyebrow>
          <h2 className="h2 h2--tight" id="faq-title">
            Dúvidas sobre os treinamentos
          </h2>
        </div>

        <div className="faq__list">
          {FAQ.map(({ q, a }) => (
            <details className="faq__item" key={q}>
              <summary>
                <h3 className="faq__q">{q}</h3>
                <span className="faq__icon" aria-hidden="true" />
              </summary>
              <p className="faq__a">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
